terraform {
  required_version = ">= 1.6.0"
}

module "vrs_network" {
  source = "./modules/network"
}

module "vrs_kubernetes" {
  source = "./modules/k8s"
}

module "vrs_databases" {
  source = "./modules/data"
}

module "vrs_monitoring" {
  source = "./modules/monitoring"
}
