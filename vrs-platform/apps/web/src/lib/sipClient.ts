type SipStatusHandler = (status: string, detail?: string) => void;

type SipModule = typeof import("sip.js");

export type SipRuntimeConfig = {
  wsServer: string;
  aor: string;
  authUser: string;
  authPassword: string;
};

class SipClient {
  private sip: SipModule | null = null;
  private userAgent: any = null;
  private registerer: any = null;
  private session: any = null;
  private initialized = false;

  private getConfig(override?: Partial<SipRuntimeConfig>): SipRuntimeConfig {
    const envConfig = {
      wsServer: process.env.NEXT_PUBLIC_SIP_WS_SERVER || "",
      aor: process.env.NEXT_PUBLIC_SIP_AOR || "",
      authUser: process.env.NEXT_PUBLIC_SIP_AUTH_USER || "",
      authPassword: process.env.NEXT_PUBLIC_SIP_AUTH_PASSWORD || ""
    };
    return {
      wsServer: override?.wsServer || envConfig.wsServer,
      aor: override?.aor || envConfig.aor,
      authUser: override?.authUser || envConfig.authUser,
      authPassword: override?.authPassword || envConfig.authPassword
    };
  }

  private normalizeTarget(target: string) {
    const trimmed = target.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("sip:") ? trimmed : `sip:${trimmed}`;
  }

  async ensureRegistered(onStatus: SipStatusHandler, override?: Partial<SipRuntimeConfig>): Promise<boolean> {
    const cfg = this.getConfig(override);
    if (!cfg.wsServer || !cfg.aor || !cfg.authUser || !cfg.authPassword) {
      onStatus("sip-config-missing", "Set NEXT_PUBLIC_SIP_* env values");
      return false;
    }

    if (!this.sip) this.sip = await import("sip.js");
    if (this.initialized) return true;

    const uri = this.sip.UserAgent.makeURI(cfg.aor);
    if (!uri) {
      onStatus("sip-config-invalid", "Invalid AOR URI");
      return false;
    }

    this.userAgent = new this.sip.UserAgent({
      uri,
      authorizationUsername: cfg.authUser,
      authorizationPassword: cfg.authPassword,
      transportOptions: { server: cfg.wsServer }
    });
    await this.userAgent.start();
    this.registerer = new this.sip.Registerer(this.userAgent);
    onStatus("sip-registering");
    await this.registerer.register();
    this.initialized = true;
    onStatus("sip-registered");
    return true;
  }

  async dial(target: string, onStatus: SipStatusHandler, override?: Partial<SipRuntimeConfig>): Promise<void> {
    const ready = await this.ensureRegistered(onStatus, override);
    if (!ready || !this.sip || !this.userAgent) return;
    if (this.session) {
      onStatus("sip-busy", "Another SIP call is active");
      return;
    }

    const targetUri = this.sip.UserAgent.makeURI(this.normalizeTarget(target));
    if (!targetUri) {
      onStatus("sip-invalid-target", target);
      return;
    }

    const inviter = new this.sip.Inviter(this.userAgent, targetUri);
    this.session = inviter;
    onStatus("sip-dialing", target);

    inviter.stateChange.addListener((state: any) => {
      if (!this.sip) return;
      if (state === this.sip.SessionState.Established) onStatus("sip-answered", target);
      if (state === this.sip.SessionState.Terminated) {
        onStatus("sip-ended", target);
        this.session = null;
      }
    });

    inviter.delegate = {
      onProgress: (response: any) => {
        const code = response?.message?.statusCode;
        if (code === 100) onStatus("sip-trying", target);
        if (code === 180 || code === 183) onStatus("sip-ringing", target);
      },
      onReject: (response: any) => {
        onStatus("sip-failed", `${response?.message?.statusCode || ""} ${response?.message?.reasonPhrase || ""}`.trim());
      }
    };

    try {
      await inviter.invite();
    } catch (err: any) {
      onStatus("sip-failed", err?.message || "invite failed");
      this.session = null;
    }
  }

  async end(onStatus: SipStatusHandler): Promise<void> {
    if (!this.session) return;
    try {
      await this.session.terminate();
      onStatus("sip-ended");
    } catch (err: any) {
      onStatus("sip-end-failed", err?.message || "terminate failed");
    } finally {
      this.session = null;
    }
  }
}

export const sipClient = new SipClient();
