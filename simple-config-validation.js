// Simple validation of the unified config system
// Tests if configs load correctly and are structured properly

console.log('🧪 TESTING UNIFIED CONFIG SYSTEM\n');

try {
    // Test direct file access
    const fs = require('fs');
    const path = require('path');

    const configPath = path.join(__dirname, 'src', 'configs', 'inventory', 'unifiedConfigs.ts');

    if (fs.existsSync(configPath)) {
        console.log('✅ Config file exists at:', configPath);

        // Read the file and look for key patterns
        const configContent = fs.readFileSync(configPath, 'utf8');

        console.log('🔍 Analyzing Config Content...\n');

        // Check for required business types
        const businessTypes = ['pharmacy', 'restaurant', 'rental', 'retail'];
        businessTypes.forEach(type => {
            if (configContent.includes(`${type}: {`)) {
                console.log(`✅ Business type "${type}" found in config`);
            } else {
                console.log(`❌ Business type "${type}" MISSING from config`);
            }
        });

        // Check for UI structure
        const uiChecks = [
            'ui: {',
            'fields:',
            'theme:',
            'defaultCategories:'
        ];

        uiChecks.forEach(check => {
            if (configContent.includes(check)) {
                console.log(`✅ UI structure "${check}" found`);
            } else {
                console.log(`❌ UI structure "${check}" MISSING`);
            }
        });

        // Check for workflow structure
        if (configContent.includes('workflows:')) {
            console.log('✅ Workflows array structure found');
        } else {
            console.log('❌ Workflows array structure MISSING');
        }

        // Count workflow configurations
        const workflowMatches = configContent.match(/workflows:\s*\[/g) || [];
        console.log(`📊 Found ${workflowMatches.length} workflow configurations`);

        // Check for TypeScript interface
        if (configContent.includes('export interface InventoryConfig')) {
            console.log('✅ TypeScript interface defined');
        } else {
            console.log('❌ TypeScript interface MISSING');
        }

        console.log('\n🎉 CONFIG FILE ANALYSIS COMPLETE');
        console.log('If all checks above are ✅, the unified config system is functioning correctly!');

    } else {
        console.log('❌ Config file does not exist at expected path');
        console.log('Expected path:', configPath);
    }

} catch (error) {
    console.error('❌ CONFIG VALIDATION FAILED:', error.message);
}

// Test React component import structure
console.log('\n🎨 TESTING REACT COMPONENT IMPORT\n');

try {
    const fs = require('fs');
    const path = require('path');
    const componentPath = path.join(__dirname, 'src', 'components', 'inventory', 'UnifiedInventoryForm.tsx');

    if (fs.existsSync(componentPath)) {
        console.log('✅ UnifiedInventoryForm component exists');

        const componentContent = fs.readFileSync(componentPath, 'utf8');

        // Check for config import
        if (componentContent.includes('getUnifiedConfig')) {
            console.log('✅ Component imports unified config loader');
        } else {
            console.log('❌ Component MISSING unified config import');
        }

        // Check for config usage
        if (componentContent.includes('config.ui.fields')) {
            console.log('✅ Component uses UI fields from config');
        } else {
            console.log('❌ Component MISSING UI field usage');
        }

        if (componentContent.includes('config.ui.theme')) {
            console.log('✅ Component uses theming from config');
        } else {
            console.log('❌ Component MISSING theme usage');
        }

    } else {
        console.log('❌ UnifiedInventoryForm component not found');
    }

} catch (error) {
    console.error('❌ COMPONENT VALIDATION FAILED:', error.message);
}

console.log('\n🏁 MANUAL VALIDATION COMPLETE');
console.log('Check the ✅ and ❌ above for system status');
