import React, { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  data?: any;
  selectable?: boolean;
  expandedIcon?: React.ReactNode;
  collapsedIcon?: React.ReactNode;
}

interface TreeProps {
  value?: TreeNode[];
  selectionMode?: "single" | "multiple" | "checkbox";
  selectionKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  expandedKeys?: string[];
  onToggle?: (event: { node: TreeNode; expanded: boolean }) => void;
  className?: string;
  nodeTemplate?: (node: TreeNode, options: any) => React.ReactNode;
}

interface TreeNodeProps {
  node: TreeNode;
  level: number;
  expanded: boolean;
  selected: boolean;
  onToggle: (node: TreeNode) => void;
  onSelect: (node: TreeNode) => void;
  selectionMode?: "single" | "multiple" | "checkbox";
  nodeTemplate?: (node: TreeNode, options: any) => React.ReactNode;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  node,
  level,
  expanded,
  selected,
  onToggle,
  onSelect,
  selectionMode,
  nodeTemplate
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const indent = level * 20;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle(node);
    }
  };

  const handleSelect = () => {
    if (node.selectable !== false) {
      onSelect(node);
    }
  };

  const defaultIcon = hasChildren 
    ? (expanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />)
    : <File className="h-4 w-4" />;

  const icon = node.icon || defaultIcon;

  if (nodeTemplate) {
    return nodeTemplate(node, { expanded, selected, level, hasChildren });
  }

  // Si estás usando TypeScript
const transformActionText = (text: string): string => {
  switch(text) {
    case 'LIST':
      return 'Listar';
    case 'CREATE':
      return 'Guardar';
    case 'DELETE':
      return 'Eliminar';
    case 'UPDATE':
      return 'Actualizar';
    default:
      return text;
  }
};

  return (
    <div className="tree-node">
      <div
        className={cn(
          "flex items-center py-1 px-2 hover:bg-muted rounded cursor-pointer select-none",
          selected && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${8 + indent}px` }}
        onClick={handleSelect}
      >
        <div className="flex items-center space-x-2 flex-1">
          {hasChildren && (
            <button
              className="p-1 hover:bg-muted rounded"
              onClick={handleToggle}
            >
              {expanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          
          {selectionMode === "checkbox" && (
            <Checkbox
              checked={selected}
              onCheckedChange={handleSelect}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          
          <div className="flex items-center space-x-2">
            {icon}
            <Label className="text-sm font-normal cursor-pointer">
              {transformActionText(node.label)}
            </Label>
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="tree-children">
          {node.children?.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              selected={selected}
              onToggle={onToggle}
              onSelect={onSelect}
              selectionMode={selectionMode}
              nodeTemplate={nodeTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Tree: React.FC<TreeProps> = ({
  value = [],
  selectionMode = "single",
  selectionKeys = [],
  onSelectionChange,
  expandedKeys = [],
  onToggle,
  className,
  nodeTemplate
}) => {
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<string[]>(expandedKeys);
  const [internalSelectionKeys, setInternalSelectionKeys] = useState<string[]>(selectionKeys);

  const isExpanded = (nodeId: string) => {
    return internalExpandedKeys.includes(nodeId);
  };

  const isSelected = (nodeId: string) => {
    return internalSelectionKeys.includes(nodeId);
  };

  const handleToggle = (node: TreeNode) => {
    const newExpandedKeys = isExpanded(node.id)
      ? internalExpandedKeys.filter(key => key !== node.id)
      : [...internalExpandedKeys, node.id];
    
    setInternalExpandedKeys(newExpandedKeys);
    onToggle?.({ node, expanded: !isExpanded(node.id) });
  };

  const handleSelect = (node: TreeNode) => {
    let newSelectionKeys: string[];

    if (selectionMode === "single") {
      newSelectionKeys = [node.id];
    } else if (selectionMode === "multiple" || selectionMode === "checkbox") {
      if (isSelected(node.id)) {
        newSelectionKeys = internalSelectionKeys.filter(key => key !== node.id);
      } else {
        newSelectionKeys = [...internalSelectionKeys, node.id];
      }
    } else {
      newSelectionKeys = internalSelectionKeys;
    }

    setInternalSelectionKeys(newSelectionKeys);
    onSelectionChange?.(newSelectionKeys);
  };

  return (
    <div className={cn("tree border rounded-md p-2 bg-background", className)}>
      {value.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          level={0}
          expanded={isExpanded(node.id)}
          selected={isSelected(node.id)}
          onToggle={handleToggle}
          onSelect={handleSelect}
          selectionMode={selectionMode}
          nodeTemplate={nodeTemplate}
        />
      ))}
    </div>
  );
};