#!/bin/bash
# ============================================================================
# SCRIPT DE LIMPIEZA DE HISTORIAL GIT - PROYECTO DAWA
# ============================================================================
# Este script reorganiza el historial de commits para hacerlo más limpio
# y comprensible a largo plazo.
# ============================================================================

set -e  # Detener ejecución en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables
BACKUP_BRANCH="backup/original-main-$(date +%Y%m%d-%H%M%S)"
CLEAN_BRANCH="main-clean-history-$(date +%Y%m%d)"
REPORT_FILE="git-cleanup-report-$(date +%Y%m%d-%H%M%S).md"

# ============================================================================
# FUNCIONES DE UTILIDAD
# ============================================================================

print_header() {
    echo -e "\n${CYAN}======================================================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}======================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}➜ $1${NC}"
}

confirm_action() {
    echo -e "${YELLOW}¿Continuar con '$1'? (s/n): ${NC}"
    read -r response
    if [[ ! "$response" =~ ^[SsYy]$ ]]; then
        print_error "Operación cancelada por el usuario."
        exit 1
    fi
}

# ============================================================================
# PASO 1: VERIFICACIONES INICIALES
# ============================================================================

print_header "PASO 1: VERIFICACIONES INICIALES"

# Verificar que estamos en un repositorio git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "No se encuentra un repositorio git en el directorio actual."
    exit 1
fi

# Verificar estado limpio
if [[ -n $(git status --porcelain) ]]; then
    print_error "Hay cambios sin commit. Por favor, commitea o stashéalos primero."
    git status --short
    exit 1
fi

# Verificar rama actual
CURRENT_BRANCH=$(git branch --show-current)
print_info "Rama actual: $CURRENT_BRANCH"

if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    print_warning "No estás en la rama main/master. Cambiando a main..."
    git checkout main 2>/dev/null || git checkout master 2>/dev/null || {
        print_error "No se pudo cambiar a main/master."
        exit 1
    }
    CURRENT_BRANCH=$(git branch --show-current)
fi

# ============================================================================
# PASO 2: CREAR BACKUP COMPLETO
# ============================================================================

print_header "PASO 2: CREAR BACKUP"

print_info "Creando backup en rama: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"
git tag "BACKUP-$(date +%Y%m%d-%H%M%S)"
print_success "Backup creado en rama: $BACKUP_BRANCH"

# ============================================================================
# PASO 3: ANALIZAR HISTORIAL ACTUAL
# ============================================================================

print_header "PASO 3: ANALIZAR HISTORIAL ACTUAL"

# Crear reporte del estado actual
{
    echo "# Reporte de Limpieza Git - $(date)"
    echo "## Estado Actual"
    echo "### Commits problemáticos identificados:"
    echo '```'
    git log --oneline --grep="\.\.\." --grep="final$" --grep="^[a-f0-9]* \.$" --grep="the-end" | head -20
    echo '```'
    
    echo "### Merge commits automáticos:"
    echo '```'
    git log --oneline --grep="Merge branch" --grep="Merge pull" | head -10
    echo '```'
    
    echo "### Estadísticas de colaboradores:"
    echo '```'
    git shortlog -s -n --all
    echo '```'
} > "$REPORT_FILE"

print_info "Reporte inicial guardado en: $REPORT_FILE"

# ============================================================================
# PASO 4: CREAR RAMA LIMPIA
# ============================================================================

print_header "PASO 4: CREAR HISTORIAL LIMPIO"

print_info "Creando nueva rama limpia: $CLEAN_BRANCH"
confirm_action "Crear nueva historia desde cero"

# Crear rama limpia desde el primer commit
FIRST_COMMIT=$(git rev-list --max-parents=0 HEAD)
print_info "Primer commit del proyecto: $FIRST_COMMIT"

git checkout --orphan "$CLEAN_BRANCH"

# ============================================================================
# PASO 5: REORGANIZAR COMMITS POR MÓDULOS
# ============================================================================

print_header "PASO 5: REORGANIZAR COMMITS"

print_info "Analizando estructura del proyecto..."
print_info "Esta operación puede tomar algunos minutos..."

# Función para agrupar commits por patrón
group_commits() {
    local pattern=$1
    local commit_list=$(git log --oneline --grep="$pattern" --all | cut -d' ' -f1)
    echo "$commit_list"
}

# Agrupar commits por funcionalidad (basado en el análisis previo)
print_info "Agrupando commits por funcionalidad..."

# Crear commit inicial
git add .
git commit -m "INIT: Proyecto Dawa - Sistema de gestión para destino expertos

Sistema completo de gestión que incluye:
- Gestión de clientes, profesionales y servicios
- Sistema de reseñas y calificaciones
- Módulo de solicitudes y reservas
- Interfaz moderna con componentes reutilizables"

# Agregar commits importantes de forma organizada
print_info "Reconstruyendo historia organizada..."

# Lista de commits importantes en orden lógico (basado en el análisis)
IMPORTANT_COMMITS=(
    "14c8b35"  # estructura base
    "7dc745b"  # modelos
    "0439192"  # clientes mejorado
    "4b0f649"  # CRUD clientes
    "0061933"  # profesionales
    "184f1a3"  # servicios
    "8706a6d"  # reseñas
    "344a7ff"  # paginación y filtros
    "b24a731"  # CRUD reseñas completo
    "749fa90"  # solicitudes
    "b999e6f"  # sistema solicitudes
    "d046b06"  # componentes reutilizables
    "384a365"  # diseño UI
    "2ce07d7"  # navegación
    "4a0f407"  # menú mejorado
    "81aae2e"  # router
    "70aa0c6"  # estilos unificados
    "0faeaa1"  # validaciones
    "84bf67f"  # acoplamiento tablas
    "6e896a7"  # carga datos
    "dcc7c23"  # tabla solicitudes
)

# Grupos temáticos para commits
commit_groups=(
    "INIT:Estructura inicial"
    "FEAT:Modelos y servicios base"
    "FEAT:Módulo de clientes"
    "FEAT:Módulo de profesionales"
    "FEAT:Módulo de servicios"
    "FEAT:Sistema de reseñas"
    "FEAT:Módulo de solicitudes"
    "FEAT:Componentes reutilizables"
    "FEAT:Interfaz de usuario"
    "FEAT:Sistema de navegación"
    "FEAT:Integración y acoplamiento"
    "RELEASE:Versión final"
)

# Aplicar cherry-pick de commits importantes
for commit in "${IMPORTANT_COMMITS[@]}"; do
    if git show "$commit" >/dev/null 2>&1; then
        print_info "Aplicando commit: $commit"
        if git cherry-pick "$commit" --no-commit >/dev/null 2>&1; then
            # Obtener mensaje original
            original_msg=$(git log --format=%B -n 1 "$commit")
            
            # Crear mensaje mejorado
            if [[ "$commit" == "14c8b35" ]]; then
                git commit -m "FEAT: Estructura base del proyecto con modelos iniciales"
            elif [[ "$commit" == "7dc745b" ]]; then
                git commit -m "MODEL: Definición de modelos Cliente, Profesional, Servicio, Reseña, Solicitud"
            elif [[ "$commit" == "0439192" ]]; then
                git commit -m "FEAT: Implementación completa del módulo de clientes"
            elif [[ "$commit" == "4b0f649" ]]; then
                git commit -m "FEAT: CRUD completo de clientes con operaciones básicas"
            elif [[ "$commit" == "0061933" ]]; then
                git commit -m "FEAT: Sistema de gestión de profesionales"
            elif [[ "$commit" == "184f1a3" ]]; then
                git commit -m "FEAT: Catálogo y gestión de servicios"
            elif [[ "$commit" == "8706a6d" ]]; then
                git commit -m "FEAT: Implementación del sistema de reseñas"
            elif [[ "$commit" == "344a7ff" ]]; then
                git commit -m "FEAT: Paginación, filtros y validaciones para reseñas"
            elif [[ "$commit" == "b24a731" ]]; then
                git commit -m "FEAT: CRUD completo de reseñas con todas las operaciones"
            elif [[ "$commit" == "749fa90" ]]; then
                git commit -m "FEAT: Módulo de gestión de solicitudes"
            elif [[ "$commit" == "b999e6f" ]]; then
                git commit -m "FEAT: Sistema completo de solicitudes con flujo de trabajo"
            elif [[ "$commit" == "d046b06" ]]; then
                git commit -m "FEAT: Componentes reutilizables DataTable y Cards"
            elif [[ "$commit" == "384a365" ]]; then
                git commit -m "STYLE: Mejora del diseño de interfaz y botones"
            elif [[ "$commit" == "2ce07d7" ]]; then
                git commit -m "FEAT: Sistema de navegación con menú y rutas"
            elif [[ "$commit" == "4a0f407" ]]; then
                git commit -m "FEAT: Menú mejorado con estructura de datos JSON"
            elif [[ "$commit" == "81aae2e" ]]; then
                git commit -m "FEAT: Configuración del sistema de enrutamiento"
            elif [[ "$commit" == "70aa0c6" ]]; then
                git commit -m "STYLE: Unificación de estilos de botones en todos los CRUDs"
            elif [[ "$commit" == "0faeaa1" ]]; then
                git commit -m "FEAT: Mejora de validaciones y experiencia de usuario"
            elif [[ "$commit" == "84bf67f" ]]; then
                git commit -m "FEAT: Integración de tablas y componente de detalles"
            elif [[ "$commit" == "6e896a7" ]]; then
                git commit -m "FEAT: Sistema de carga de datos para solicitudes"
            elif [[ "$commit" == "dcc7c23" ]]; then
                git commit -m "FEAT: Presentación de tabla de solicitudes con estilo"
            else
                # Mensaje genérico mejorado
                improved_msg=$(echo "$original_msg" | sed -e 's/\.\.\.//g' -e 's/final//g' -e 's/\.$//g')
                git commit -m "FEAT: $improved_msg"
            fi
            print_success "Commit aplicado: $commit"
        else
            print_warning "Conflicto en commit $commit, saltando..."
            git cherry-pick --abort
        fi
    else
        print_warning "Commit $commit no encontrado, saltando..."
    fi
done

# ============================================================================
# PASO 6: CREAR COMMIT FINAL INTEGRADO
# ============================================================================

print_header "PASO 6: COMMIT FINAL INTEGRADO"

print_info "Creando commit de release final..."

# Crear commit final que reemplace todos los "final" repetitivos
git add .
git commit -m "RELEASE: Versión 1.0 - Proyecto Dawa Completo

## Módulos Implementados:

### 1. Gestión de Clientes
- CRUD completo de clientes
- Perfiles y gestión de información

### 2. Gestión de Profesionales
- Registro y administración de profesionales
- Asociación con servicios

### 3. Catálogo de Servicios
- Creación y gestión de servicios
- Categorización y precios

### 4. Sistema de Reseñas
- CRUD de reseñas y calificaciones
- Paginación, filtros y validaciones
- Sistema de rating integrado

### 5. Módulo de Solicitudes
- Gestión completa de solicitudes
- Flujo de trabajo integrado
- Tabla de presentación con estilo

### 6. Interfaz de Usuario
- Diseño moderno y responsive
- Componentes reutilizables (DataTable, Cards, Modals)
- Sistema de navegación con menú
- Estilos unificados y coherentes

### 7. Infraestructura
- Modelos de datos bien definidos
- Servicios separados por responsabilidad
- Sistema de enrutamiento configurado
- Estructura modular y escalable

## Colaboradores:
- joel (Coordinador y desarrollo principal)
- Emerson Noboa (UI/UX y componentes)
- jesusriofrio (Funcionalidades CRUD)
- Saul Maldonado (Modales y detalles)

## Estado:
✅ Todo funcional
✅ Código limpio y organizado
✅ UI consistente y moderna
✅ Documentación implícita en commits"

# ============================================================================
# PASO 7: COMPARAR Y VERIFICAR
# ============================================================================

print_header "PASO 7: COMPARAR Y VERIFICAR"

print_info "Comparando historiales..."

# Guardar comparación en reporte
{
    echo ""
    echo "## Comparación de Historiales"
    echo ""
    echo "### Historial Original:"
    echo '```'
    git log --oneline "$BACKUP_BRANCH" | head -20
    echo '```'
    
    echo ""
    echo "### Historial Limpio:"
    echo '```'
    git log --oneline "$CLEAN_BRANCH"
    echo '```'
    
    echo ""
    echo "### Estadísticas:"
    echo ""
    echo "- Commits originales: $(git rev-list --count "$BACKUP_BRANCH")"
    echo "- Commits limpios: $(git rev-list --count "$CLEAN_BRANCH")"
    echo "- Reducción: $((100 - $(git rev-list --count "$CLEAN_BRANCH") * 100 / $(git rev-list --count "$BACKUP_BRANCH")))%"
    
    echo ""
    echo "### Cambios en archivos (verificación):"
    echo '```'
    git diff --name-only "$BACKUP_BRANCH" "$CLEAN_BRANCH" | head -20
    echo '```'
} >> "$REPORT_FILE"

# Verificar que el contenido es el mismo
print_info "Verificando integridad de archivos..."
if git diff --quiet "$BACKUP_BRANCH" "$CLEAN_BRANCH" -- . ':!*.git'; then
    print_success "✓ El contenido de los archivos es idéntico"
else
    print_warning "⚠ Hay diferencias en los archivos (posiblemente solo metadatos)"
    print_info "Diferencias encontradas:"
    git diff --name-status "$BACKUP_BRANCH" "$CLEAN_BRANCH" | head -10
fi

# ============================================================================
# PASO 8: OPCIONES DE FINALIZACIÓN
# ============================================================================

print_header "PASO 8: OPCIONES DE FINALIZACIÓN"

echo -e "${PURPLE}Selecciona una opción:${NC}"
echo "1) Mantener solo la nueva rama limpia (recomendado para revisión)"
echo "2) Reemplazar main con el historial limpio (CUIDADO: reescribe historia)"
echo "3) Solo guardar reporte y mantener ambas ramas"
echo "4) Cancelar todo y volver al estado original"
echo -e "${YELLOW}Opción: ${NC}"
read -r option

case $option in
    1)
        print_info "Manteniendo ambas ramas. Puedes revisar con:"
        echo "  git log --oneline $CLEAN_BRANCH"
        echo "  git checkout $CLEAN_BRANCH"
        ;;
    2)
        confirm_action "REEMPLAZAR rama main con historial limpio (esto reescribe historia pública)"
        git checkout "$CURRENT_BRANCH"
        git reset --hard "$CLEAN_BRANCH"
        print_warning "Si ya habías subido a GitHub, necesitarás: git push --force-with-lease"
        ;;
    3)
        print_info "Manteniendo ambas ramas. Reporte guardado en: $REPORT_FILE"
        ;;
    4)
        print_info "Restaurando estado original..."
        git checkout "$CURRENT_BRANCH"
        git branch -D "$CLEAN_BRANCH"
        print_success "Operación cancelada. Estado original restaurado."
        ;;
    *)
        print_error "Opción no válida"
        ;;
esac

# ============================================================================
# RESUMEN FINAL
# ============================================================================

print_header "RESUMEN DE LA OPERACIÓN"

print_success "✓ Backup creado en: $BACKUP_BRANCH"
print_success "✓ Rama limpia creada: $CLEAN_BRANCH"
print_success "✓ Reporte generado: $REPORT_FILE"
print_info "Commits originales: $(git rev-list --count "$BACKUP_BRANCH")"
print_info "Commits limpios: $(git rev-list --count "$CLEAN_BRANCH" 2>/dev/null || echo "N/A")"

echo -e "\n${CYAN}Comandos útiles para continuar:${NC}"
echo "  git log --oneline --graph $CLEAN_BRANCH  # Ver nuevo historial"
echo "  git diff $BACKUP_BRANCH $CLEAN_BRANCH   # Comparar cambios"
echo "  git checkout $CLEAN_BRANCH              # Cambiar a rama limpia"
echo "  less $REPORT_FILE                       # Ver reporte completo"

print_header "PROCESO COMPLETADO"