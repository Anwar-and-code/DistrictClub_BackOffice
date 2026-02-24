-- ============================================================
-- RBAC: Profils, Permissions & Route de base
-- ============================================================

-- 1. Table des profils (rôles avec hiérarchie et route de base)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  base_route VARCHAR(100) NOT NULL DEFAULT '/',
  hierarchy_level INTEGER NOT NULL DEFAULT 10,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Profils applicatifs avec permissions et route de base après connexion';
COMMENT ON COLUMN profiles.hierarchy_level IS 'Niveau hiérarchique (1 = plus haut). Un profil ne peut gérer que les profils de niveau supérieur au sien.';
COMMENT ON COLUMN profiles.base_route IS 'Route de redirection après connexion';
COMMENT ON COLUMN profiles.is_system IS 'Profil système non supprimable';

-- 2. Table des permissions disponibles
CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(50) PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE permissions IS 'Liste de toutes les permissions applicatives';

-- 3. Table de jonction profil <-> permissions
CREATE TABLE IF NOT EXISTS profile_permissions (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission_id VARCHAR(50) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, permission_id)
);

COMMENT ON TABLE profile_permissions IS 'Affectation des permissions aux profils';

-- 4. Ajouter profile_id à la table employees
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE employees ADD COLUMN profile_id UUID REFERENCES profiles(id);
  END IF;
END $$;

-- ============================================================
-- Données initiales : Permissions
-- ============================================================
INSERT INTO permissions (id, display_name, description, category, sort_order) VALUES
  -- Dashboard
  ('dashboard.view',       'Voir le tableau de bord',      'Accès au tableau de bord principal',        'Dashboard',      1),
  -- Caisse
  ('caisse.view',          'Accéder à la caisse',          'Ouvrir et utiliser la caisse',               'Caisse',         10),
  ('caisse.manage',        'Gérer la caisse',              'Fermer la caisse, annuler des commandes',    'Caisse',         11),
  -- Réservations
  ('reservations.view',    'Voir les réservations',        'Consulter les réservations',                 'Réservations',   20),
  ('reservations.manage',  'Gérer les réservations',       'Créer, modifier, annuler des réservations',  'Réservations',   21),
  -- Terrains
  ('terrains.view',        'Voir les terrains',            'Consulter les terrains',                     'Terrains',       30),
  ('terrains.manage',      'Gérer les terrains',           'Créer, modifier les terrains',               'Terrains',       31),
  -- Créneaux
  ('creneaux.view',        'Voir les créneaux',            'Consulter les créneaux horaires',            'Créneaux',       40),
  ('creneaux.manage',      'Gérer les créneaux',           'Créer, modifier les créneaux',               'Créneaux',       41),
  -- Joueurs
  ('joueurs.view',         'Voir les joueurs',             'Consulter la liste des joueurs',             'Joueurs',        50),
  ('joueurs.manage',       'Gérer les joueurs',            'Créer, modifier les joueurs',                'Joueurs',        51),
  -- Produits
  ('produits.view',        'Voir les produits',            'Consulter les produits et le stock',         'Produits',       60),
  ('produits.manage',      'Gérer les produits',           'Créer, modifier les produits et le stock',   'Produits',       61),
  -- Dépenses
  ('depenses.view',        'Voir les dépenses',            'Consulter les dépenses',                     'Dépenses',       70),
  ('depenses.manage',      'Gérer les dépenses',           'Créer, modifier les dépenses',               'Dépenses',       71),
  -- Employés
  ('employes.view',        'Voir les employés',            'Consulter la liste des employés',            'Employés',       80),
  ('employes.manage',      'Gérer les employés',           'Créer, modifier, supprimer des employés',    'Employés',       81),
  -- Statistiques
  ('statistiques.view',    'Voir les statistiques',        'Accès aux rapports et statistiques',         'Statistiques',   90),
  -- Paramètres
  ('parametres.manage',    'Gérer les paramètres',         'Modifier les paramètres de l''application',  'Paramètres',     100)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Données initiales : Profils par défaut
-- ============================================================
INSERT INTO profiles (id, name, display_name, description, base_route, hierarchy_level, is_system) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin',       'Administrateur', 'Accès total au système',                      '/',          1, TRUE),
  ('00000000-0000-0000-0000-000000000002', 'gerant',      'Gérant',         'Gestion complète de l''établissement',         '/',          2, TRUE),
  ('00000000-0000-0000-0000-000000000003', 'superviseur', 'Superviseur',    'Supervision des opérations quotidiennes',      '/reservations', 3, TRUE),
  ('00000000-0000-0000-0000-000000000004', 'caissiere',   'Caissière',      'Gestion de la caisse et des réservations',     '/caisse',    4, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Affectation des permissions aux profils par défaut
-- ============================================================

-- Admin : toutes les permissions
INSERT INTO profile_permissions (profile_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions
ON CONFLICT DO NOTHING;

-- Gérant : tout sauf employes.manage et parametres.manage
INSERT INTO profile_permissions (profile_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions
WHERE id NOT IN ('employes.manage', 'parametres.manage')
ON CONFLICT DO NOTHING;

-- Superviseur : vue + gestion opérationnelle
INSERT INTO profile_permissions (profile_id, permission_id)
VALUES
  ('00000000-0000-0000-0000-000000000003', 'dashboard.view'),
  ('00000000-0000-0000-0000-000000000003', 'caisse.view'),
  ('00000000-0000-0000-0000-000000000003', 'caisse.manage'),
  ('00000000-0000-0000-0000-000000000003', 'reservations.view'),
  ('00000000-0000-0000-0000-000000000003', 'reservations.manage'),
  ('00000000-0000-0000-0000-000000000003', 'terrains.view'),
  ('00000000-0000-0000-0000-000000000003', 'creneaux.view'),
  ('00000000-0000-0000-0000-000000000003', 'joueurs.view'),
  ('00000000-0000-0000-0000-000000000003', 'joueurs.manage'),
  ('00000000-0000-0000-0000-000000000003', 'produits.view'),
  ('00000000-0000-0000-0000-000000000003', 'depenses.view'),
  ('00000000-0000-0000-0000-000000000003', 'statistiques.view')
ON CONFLICT DO NOTHING;

-- Caissière : caisse + réservations (vue)
INSERT INTO profile_permissions (profile_id, permission_id)
VALUES
  ('00000000-0000-0000-0000-000000000004', 'caisse.view'),
  ('00000000-0000-0000-0000-000000000004', 'caisse.manage'),
  ('00000000-0000-0000-0000-000000000004', 'reservations.view'),
  ('00000000-0000-0000-0000-000000000004', 'reservations.manage'),
  ('00000000-0000-0000-0000-000000000004', 'joueurs.view'),
  ('00000000-0000-0000-0000-000000000004', 'produits.view')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Mettre à jour les employés existants : mapper role → profile_id
-- ============================================================
UPDATE employees SET profile_id = '00000000-0000-0000-0000-000000000001' WHERE role = 'admin'       AND profile_id IS NULL;
UPDATE employees SET profile_id = '00000000-0000-0000-0000-000000000002' WHERE role = 'gerant'      AND profile_id IS NULL;
UPDATE employees SET profile_id = '00000000-0000-0000-0000-000000000003' WHERE role = 'superviseur' AND profile_id IS NULL;
UPDATE employees SET profile_id = '00000000-0000-0000-0000-000000000004' WHERE role = 'caissiere'   AND profile_id IS NULL;

-- ============================================================
-- Fonction RPC : login avec profil et permissions
-- ============================================================
CREATE OR REPLACE FUNCTION verify_employee_password_v2(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  username VARCHAR,
  full_name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  profile_id UUID,
  profile_name VARCHAR,
  profile_display_name VARCHAR,
  base_route VARCHAR,
  hierarchy_level INTEGER,
  permissions TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.username,
    e.full_name,
    e.role,
    e.is_active,
    e.profile_id,
    p.name AS profile_name,
    p.display_name AS profile_display_name,
    p.base_route,
    p.hierarchy_level,
    COALESCE(
      ARRAY(
        SELECT pp.permission_id
        FROM profile_permissions pp
        WHERE pp.profile_id = e.profile_id
        ORDER BY pp.permission_id
      ),
      ARRAY[]::TEXT[]
    ) AS permissions
  FROM employees e
  LEFT JOIN profiles p ON p.id = e.profile_id
  WHERE e.username = p_username
    AND e.password_hash = crypt(p_password, e.password_hash)
    AND e.is_active = TRUE;
END;
$$;

-- ============================================================
-- Fonction utilitaire : vérifier une permission pour un employé
-- ============================================================
CREATE OR REPLACE FUNCTION employee_has_permission(
  p_employee_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM employees e
    JOIN profile_permissions pp ON pp.profile_id = e.profile_id
    WHERE e.id = p_employee_id
      AND pp.permission_id = p_permission
      AND e.is_active = TRUE
  );
END;
$$;
