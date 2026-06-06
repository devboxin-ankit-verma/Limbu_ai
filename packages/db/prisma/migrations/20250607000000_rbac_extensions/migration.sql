-- RBAC extensions: platform super admin + org viewer role

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_super_admin" BOOLEAN NOT NULL DEFAULT false;

ALTER TYPE "OrgRole" ADD VALUE IF NOT EXISTS 'viewer';
