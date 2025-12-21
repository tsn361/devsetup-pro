/**
 * DependencyResolver - Handles dependency resolution and conflict detection for tools
 */
class DependencyResolver {
  /**
   * Resolve dependencies and detect conflicts for selected tools
   * @param {Array} selectedTools - Array of selected tool objects
   * @param {Array} allTools - Array of all available tool objects
   * @returns {Object} - Object with installOrder array and conflicts array
   */
  static resolve(selectedTools, allTools) {
    const result = {
      installOrder: [],
      conflicts: [],
    };

    // Check for conflicts first
    result.conflicts = this.detectConflicts(selectedTools);

    if (result.conflicts.length > 0) {
      return result;
    }

    // Build dependency graph
    const toolsMap = new Map(allTools.map((tool) => [tool.id, tool]));
    const visited = new Set();
    const installOrder = [];

    // Resolve dependencies for each selected tool
    for (const tool of selectedTools) {
      this.resolveDependencies(tool, toolsMap, visited, installOrder);
    }

    result.installOrder = installOrder;
    return result;
  }

  /**
   * Recursively resolve dependencies for a tool
   * @private
   * @param {Object} tool - Tool object
   * @param {Map} toolsMap - Map of tool IDs to tool objects
   * @param {Set} visited - Set of visited tool IDs
   * @param {Array} installOrder - Array to store installation order
   */
  static resolveDependencies(tool, toolsMap, visited, installOrder) {
    // Skip if already visited
    if (visited.has(tool.id)) {
      return;
    }

    // Mark as visited
    visited.add(tool.id);

    // Process dependencies first
    if (tool.dependencies && tool.dependencies.length > 0) {
      for (const depId of tool.dependencies) {
        const depTool = toolsMap.get(depId);
        if (depTool) {
          this.resolveDependencies(depTool, toolsMap, visited, installOrder);
        }
      }
    }

    // Add tool to install order
    installOrder.push(tool);
  }

  /**
   * Detect conflicts between selected tools
   * @param {Array} selectedTools - Array of selected tool objects
   * @returns {Array} - Array of conflict objects
   */
  static detectConflicts(selectedTools) {
    const conflicts = [];

    // Check each pair of tools for conflicts
    for (let i = 0; i < selectedTools.length; i++) {
      const tool1 = selectedTools[i];

      for (let j = i + 1; j < selectedTools.length; j++) {
        const tool2 = selectedTools[j];

        // Check if tool1 conflicts with tool2
        if (
          tool1.conflicts &&
          tool1.conflicts.includes(tool2.id)
        ) {
          conflicts.push({
            tool1: tool1.id,
            tool1Name: tool1.name,
            tool2: tool2.id,
            tool2Name: tool2.name,
            reason: `${tool1.name} conflicts with ${tool2.name}`,
          });
        }

        // Check if tool2 conflicts with tool1
        if (
          tool2.conflicts &&
          tool2.conflicts.includes(tool1.id)
        ) {
          conflicts.push({
            tool1: tool2.id,
            tool1Name: tool2.name,
            tool2: tool1.id,
            tool2Name: tool1.name,
            reason: `${tool2.name} conflicts with ${tool1.name}`,
          });
        }
      }
    }

    // Remove duplicate conflicts
    const uniqueConflicts = [];
    const seen = new Set();

    for (const conflict of conflicts) {
      const key = [conflict.tool1, conflict.tool2].sort().join('-');
      if (!seen.has(key)) {
        seen.add(key);
        uniqueConflicts.push(conflict);
      }
    }

    return uniqueConflicts;
  }

  /**
   * Get all dependencies (including transitive) for a tool
   * @param {Object} tool - Tool object
   * @param {Array} allTools - Array of all available tools
   * @returns {Array} - Array of all dependency tool objects
   */
  static getAllDependencies(tool, allTools) {
    const toolsMap = new Map(allTools.map((t) => [t.id, t]));
    const dependencies = [];
    const visited = new Set();

    const collectDependencies = (currentTool) => {
      if (visited.has(currentTool.id)) {
        return;
      }

      visited.add(currentTool.id);

      if (currentTool.dependencies && currentTool.dependencies.length > 0) {
        for (const depId of currentTool.dependencies) {
          const depTool = toolsMap.get(depId);
          if (depTool) {
            dependencies.push(depTool);
            collectDependencies(depTool);
          }
        }
      }
    };

    collectDependencies(tool);
    return dependencies;
  }

  /**
   * Check if adding a tool would create circular dependencies
   * @param {Object} tool - Tool to check
   * @param {Array} allTools - Array of all available tools
   * @returns {boolean} - True if circular dependency detected
   */
  static hasCircularDependency(tool, allTools) {
    const toolsMap = new Map(allTools.map((t) => [t.id, t]));
    const visiting = new Set();
    const visited = new Set();

    const checkCircular = (currentTool) => {
      if (visiting.has(currentTool.id)) {
        return true; // Circular dependency found
      }

      if (visited.has(currentTool.id)) {
        return false; // Already checked
      }

      visiting.add(currentTool.id);

      if (currentTool.dependencies && currentTool.dependencies.length > 0) {
        for (const depId of currentTool.dependencies) {
          const depTool = toolsMap.get(depId);
          if (depTool && checkCircular(depTool)) {
            return true;
          }
        }
      }

      visiting.delete(currentTool.id);
      visited.add(currentTool.id);

      return false;
    };

    return checkCircular(tool);
  }

  /**
   * Get reverse dependencies (tools that depend on this tool)
   * @param {string} toolId - Tool ID to check
   * @param {Array} allTools - Array of all available tools
   * @returns {Array} - Array of tools that depend on this tool
   */
  static getReverseDependencies(toolId, allTools) {
    return allTools.filter(
      (tool) => tool.dependencies && tool.dependencies.includes(toolId)
    );
  }

  /**
   * Validate tool configuration for dependency issues
   * @param {Array} allTools - Array of all tool objects
   * @returns {Object} - Validation result with errors and warnings
   */
  static validateConfiguration(allTools) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
    };

    const toolIds = new Set(allTools.map((t) => t.id));

    for (const tool of allTools) {
      // Check for missing dependencies
      if (tool.dependencies && tool.dependencies.length > 0) {
        for (const depId of tool.dependencies) {
          if (!toolIds.has(depId)) {
            result.valid = false;
            result.errors.push({
              tool: tool.id,
              error: `Missing dependency: ${depId}`,
            });
          }
        }
      }

      // Check for circular dependencies
      if (this.hasCircularDependency(tool, allTools)) {
        result.valid = false;
        result.errors.push({
          tool: tool.id,
          error: 'Circular dependency detected',
        });
      }

      // Check for self-dependency
      if (tool.dependencies && tool.dependencies.includes(tool.id)) {
        result.valid = false;
        result.errors.push({
          tool: tool.id,
          error: 'Tool depends on itself',
        });
      }

      // Check for conflicting dependencies
      if (tool.dependencies && tool.conflicts) {
        const overlap = tool.dependencies.filter((depId) =>
          tool.conflicts.includes(depId)
        );

        if (overlap.length > 0) {
          result.valid = false;
          result.errors.push({
            tool: tool.id,
            error: `Tool depends on conflicting tools: ${overlap.join(', ')}`,
          });
        }
      }

      // Warning: Tool with many dependencies
      if (tool.dependencies && tool.dependencies.length > 5) {
        result.warnings.push({
          tool: tool.id,
          warning: `Tool has ${tool.dependencies.length} dependencies`,
        });
      }
    }

    return result;
  }

  /**
   * Build a dependency graph representation
   * @param {Array} tools - Array of tool objects
   * @returns {Object} - Graph object with nodes and edges
   */
  static buildDependencyGraph(tools) {
    const graph = {
      nodes: [],
      edges: [],
    };

    for (const tool of tools) {
      // Add node
      graph.nodes.push({
        id: tool.id,
        name: tool.name,
        dependencyCount: tool.dependencies ? tool.dependencies.length : 0,
        conflictCount: tool.conflicts ? tool.conflicts.length : 0,
      });

      // Add edges for dependencies
      if (tool.dependencies && tool.dependencies.length > 0) {
        for (const depId of tool.dependencies) {
          graph.edges.push({
            from: tool.id,
            to: depId,
            type: 'dependency',
          });
        }
      }

      // Add edges for conflicts
      if (tool.conflicts && tool.conflicts.length > 0) {
        for (const conflictId of tool.conflicts) {
          graph.edges.push({
            from: tool.id,
            to: conflictId,
            type: 'conflict',
          });
        }
      }
    }

    return graph;
  }

  /**
   * Suggest additional tools based on dependencies
   * @param {Array} selectedTools - Array of selected tools
   * @param {Array} allTools - Array of all available tools
   * @returns {Array} - Array of suggested tools to add
   */
  static suggestAdditionalTools(selectedTools, allTools) {
    const selectedIds = new Set(selectedTools.map((t) => t.id));
    const suggestions = new Set();

    for (const tool of selectedTools) {
      if (tool.dependencies && tool.dependencies.length > 0) {
        for (const depId of tool.dependencies) {
          if (!selectedIds.has(depId)) {
            suggestions.add(depId);
          }
        }
      }
    }

    return allTools.filter((tool) => suggestions.has(tool.id));
  }
}

module.exports = DependencyResolver;
