// components/ui/multi-select.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Role } from '@/pages/roles/interfaces/rol.interface';

interface MultiSelectProps {
  options: Role[];
  selectedValues: (string | number)[];
  onValueChange: (values: (string | number)[]) => void;
  placeholder?: string;
  className?: string;
  displayKey?: string; // Para mostrar propiedades específicas de objetos complejos
  showBadgeCount?: boolean; // Mostrar contador en lugar de todos los badges
  currentUserRole?: string; // Rol del usuario actual para filtrar opciones
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onValueChange,
  placeholder = "Seleccionar opciones...",
  className,
  displayKey,
  showBadgeCount = false,
  currentUserRole // Rol específico para filtrar
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar opciones basado en el rol del usuario actual
  const filteredOptions = React.useMemo(() => {
    if (!currentUserRole) return options;
    
    // Filtrar opciones según el rol del usuario
    // Por ejemplo, si el usuario es "admin", mostrar todos los roles
    // Si es otro rol, mostrar solo roles específicos
    switch (currentUserRole.toLowerCase()) {
      case 'admin':
        return options; // Mostrar todos los roles
      case 'supervisor':
        return options.filter(option => 
          option.name.toLowerCase() !== 'admin'
        );
      case 'usuario':
        return options.filter(option => 
          !['admin', 'supervisor'].includes(option.name.toLowerCase())
        );
      default:
        return options.filter(option => 
          option.name.toLowerCase() === currentUserRole.toLowerCase()
        );
    }
  }, [options, currentUserRole]);

  const toggleOption = (value: string | number) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onValueChange(newValues);
  };

  const removeOption = (value: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(selectedValues.filter(v => v !== value));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange([]);
  };

  const selectedOptions = filteredOptions.filter(option => 
    option.id && selectedValues.includes(option.id)
  );

  // Función para obtener el texto a mostrar basado en displayKey
  const getDisplayText = (option: Role) => {
    if (!displayKey) return option.name;
    
    // Si hay un displayKey, intenta acceder a la propiedad anidada
    const keys = displayKey.split('.');
    let value: any = option;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return option.name; // Fallback al name
      }
    }
    
    return value?.toString() || option.name;
  };

  // Función para obtener la descripción o información adicional
  const getDescription = (option: Role) => {
    if (option.description) {
      return option.description;
    }
    
    // Mostrar información sobre permisos si no hay descripción
    const permissionCount = option.permissions?.length || 0;
    return `${permissionCount} permiso${permissionCount !== 1 ? 's' : ''}`;
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Trigger */}
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-between h-auto min-h-10",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
        onClick={() => setIsOpen(!isOpen)}
        disabled={filteredOptions.length === 0} // Deshabilitar si no hay opciones disponibles
      >
        <div className="flex flex-wrap gap-1 flex-1 text-left items-center">
          {selectedOptions.length === 0 ? (
            <span className="text-muted-foreground">
              {filteredOptions.length === 0 ? "No hay opciones disponibles" : placeholder}
            </span>
          ) : showBadgeCount ? (
            <Badge variant="secondary" className="mr-1">
              {selectedOptions.length} seleccionado{selectedOptions.length !== 1 ? 's' : ''}
            </Badge>
          ) : (
            selectedOptions.map(option => (
              <Badge
                key={option.id}
                variant="secondary"
                className="mb-1 mr-1 max-w-[200px] truncate"
              >
                {getDisplayText(option)}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer flex-shrink-0"
                  onClick={(e) => option.id && removeOption(option.id, e)}
                />
              </Badge>
            ))
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {selectedOptions.length > 0 && (
            <X
              className="h-4 w-4 opacity-50 hover:opacity-70 cursor-pointer"
              onClick={clearAll}
            />
          )}
          <ChevronDown className={cn(
            "h-4 w-4 opacity-50 transition-transform",
            isOpen && "rotate-180",
            filteredOptions.length === 0 && "opacity-20"
          )} />
        </div>
      </Button>

      {/* Dropdown */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            {filteredOptions.map(option => (
              <div
                key={option.id}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
                  option.id && selectedValues.includes(option.id) 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => option.id && toggleOption(option.id)}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {option.id && selectedValues.includes(option.id) && (
                    <Check className="h-4 w-4" />
                  )}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{getDisplayText(option)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {getDescription(option)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};