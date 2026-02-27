# Sweden Prescriber Workflow (Förskrivare)

## Purpose
Define end-to-end prescriber workflow that bridges user needs to relay service enrollment and ongoing support.

## Primary Actors
- Prescriber (accessibility professional)
- Deaf user / user representative
- Service provider enrollment team
- Support and operations teams

## Workflow Stages
1. Assessment
- communication needs assessment
- eligibility determination
- service-type recommendation (video/text/speech relay)

2. Enrollment and Setup
- user registration
- policy and preference capture
- device/app access provisioning
- interpreter preference configuration

3. Training and Activation
- onboarding session completion
- practical usage verification
- support contact path confirmation

4. Follow-up and Adjustment
- usage review and issue tracking
- preference updates and service adjustments
- reassessment schedule and case notes

## Prescriber Portal Requirements
1. Assessment Forms
- standardized intake and eligibility forms

2. Enrollment Console
- account provisioning
- service-profile assignment

3. Training Tracker
- training status and completion dates

4. Follow-up Planner
- reminder queue and case follow-ups

5. Case Notes and Audit
- structured notes with role-based access

## Required Data Fields
- `user_id`
- `prescriber_id`
- `assessment_result`
- `service_profile`
- `interpreter_preferences`
- `training_status`
- `followup_date`
- `case_status`

## Safety and Compliance Rules
- user consent required for preference-sensitive constraints
- policy profile must match country/tenant rules
- every prescriber action must be auditable
