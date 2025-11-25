/* ============================================
   Project Manager - Save/Load scan configurations
   ============================================ */

const ProjectManager = {
    // Save current configuration as a project
    async saveProject(projectName) {
        if (!projectName) {
            projectName = prompt('Enter project name:');
            if (!projectName) return;
        }

        try {
            const projectData = {
                name: projectName,
                created: new Date().toISOString(),
                options: OptionsMapper.getAllOptions(),
                version: '1.0'
            };

            const result = await window.sqlmapAPI.saveProject(projectData);

            if (result.success) {
                showNotification(`Project "${projectName}" saved successfully!`, 'success');
            } else {
                showNotification(`Failed to save project: ${result.message}`, 'error');
            }
        } catch (error) {
            showNotification(`Error saving project: ${error.message}`, 'error');
        }
    },

    // Load a project configuration
    async loadProject(projectName) {
        if (!projectName) {
            // Show project selector
            await this.showProjectSelector();
            return;
        }

        try {
            const result = await window.sqlmapAPI.loadProject(projectName);

            if (result.success) {
                const projectData = result.data;

                // Load options into UI
                OptionsMapper.setAllOptions(projectData.options);

                showNotification(`Project "${projectName}" loaded successfully!`, 'success');
            } else {
                showNotification(`Failed to load project: ${result.message}`, 'error');
            }
        } catch (error) {
            showNotification(`Error loading project: ${error.message}`, 'error');
        }
    },

    // Show project selector dialog
    async showProjectSelector() {
        try {
            const result = await window.sqlmapAPI.listProjects();

            if (!result.success || result.projects.length === 0) {
                showNotification('No saved projects found.', 'info');
                return;
            }

            // Create simple selector (in a real app, this would be a modal)
            const projectName = prompt(`Select project:\n${result.projects.join('\n')}`);
            if (projectName && result.projects.includes(projectName)) {
                await this.loadProject(projectName);
            }
        } catch (error) {
            showNotification(`Error listing projects: ${error.message}`, 'error');
        }
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectManager;
}
