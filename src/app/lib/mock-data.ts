import { Timestamp } from 'firebase/firestore';

export interface Tenant {
  id: string;
  name: string;
  country: string;
  status: 'active' | 'suspended';
  planId: string;
  activeModules: string[];
  createdAt: string;
}

export interface ModuleCatalog {
  id: string;
  name: string;
  version: string;
  remoteUrl: string;
  dependencies: string[];
  status: 'active' | 'inactive';
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  modulesIncluded: string[];
  limits: Record<string, any>;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'trial' | 'suspended';
  startedAt: string;
  expiresAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  adminId: string;
  entity: string;
  entityId: string;
  timestamp: string;
}

export const MOCK_MODULES: ModuleCatalog[] = [
  { id: 'mod_crm', name: 'CRM Núcleo', version: '1.2.0', remoteUrl: 'https://cdn.terabound.com/modules/crm', dependencies: [], status: 'active' },
  { id: 'mod_fin', name: 'Finanzas', version: '2.0.4', remoteUrl: 'https://cdn.terabound.com/modules/finance', dependencies: [], status: 'active' },
  { id: 'mod_inv', name: 'Inventario Pro', version: '1.1.0', remoteUrl: 'https://cdn.terabound.com/modules/inventory', dependencies: ['mod_fin'], status: 'active' },
  { id: 'mod_hr', name: 'Gestión RRHH', version: '1.0.5', remoteUrl: 'https://cdn.terabound.com/modules/hr', dependencies: [], status: 'inactive' },
];

export const MOCK_PLANS: Plan[] = [
  { id: 'plan_starter', name: 'Inicial', price: 49, modulesIncluded: ['mod_crm'], limits: { users: 5, storage: '10GB' } },
  { id: 'plan_business', name: 'Negocios', price: 199, modulesIncluded: ['mod_crm', 'mod_fin'], limits: { users: 20, storage: '100GB' } },
  { id: 'plan_enterprise', name: 'Corporativo', price: 999, modulesIncluded: ['mod_crm', 'mod_fin', 'mod_inv'], limits: { users: 1000, storage: 'Ilimitado' } },
];

export const MOCK_TENANTS: Tenant[] = [
  { id: 'ten_001', name: 'Acme Corp', country: 'España', status: 'active', planId: 'plan_enterprise', activeModules: ['mod_crm', 'mod_fin', 'mod_inv'], createdAt: '2023-10-12T10:00:00Z' },
  { id: 'ten_002', name: 'Globex Ltd', country: 'México', status: 'active', planId: 'plan_business', activeModules: ['mod_crm', 'mod_fin'], createdAt: '2023-11-05T14:30:00Z' },
  { id: 'ten_003', name: 'Soylent Co', country: 'Colombia', status: 'suspended', planId: 'plan_starter', activeModules: ['mod_crm'], createdAt: '2024-01-20T09:15:00Z' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log_001', action: 'TENANT_CREATE', adminId: 'admin_jane', entity: 'Tenant', entityId: 'ten_001', timestamp: '2023-10-12T10:00:00Z' },
  { id: 'log_002', action: 'PLAN_UPDATE', adminId: 'admin_bob', entity: 'Subscription', entityId: 'sub_002', timestamp: '2023-11-15T11:20:00Z' },
  { id: 'log_003', action: 'MODULE_ACTIVATE', adminId: 'admin_jane', entity: 'Tenant', entityId: 'ten_002', timestamp: '2024-02-10T16:45:00Z' },
];
