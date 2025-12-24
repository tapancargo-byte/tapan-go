// ESLint rules for design system consistency
module.exports = {
  rules: {
    // Prevent hardcoded colors in className
    'no-hardcoded-colors': {
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.name.name === 'className' && node.value && node.value.type === 'Literal') {
              const value = node.value.value;
              
              // Check for hardcoded hex colors
              const hexColorRegex = /#[0-9a-fA-F]{3,6}/g;
              if (hexColorRegex.test(value)) {
                context.report({
                  node,
                  message: 'Avoid hardcoded hex colors in className. Use design tokens instead.',
                });
              }
              
              // Check for hardcoded RGB/RGBA colors
              const rgbRegex = /rgba?\([^)]+\)/g;
              if (rgbRegex.test(value)) {
                context.report({
                  node,
                  message: 'Avoid hardcoded RGB colors in className. Use design tokens instead.',
                });
              }
              
              // Check for arbitrary values that should use design tokens
              const arbitrarySpacingRegex = /(?:p|m|gap|space)-\[[^\]]+\]/g;
              if (arbitrarySpacingRegex.test(value)) {
                context.report({
                  node,
                  message: 'Avoid arbitrary spacing values. Use design tokens like p-4, gap-6, space-y-4 instead.',
                });
              }
              
              // Check for arbitrary font sizes
              const arbitraryFontRegex = /text-\[[^\]]+\]/g;
              if (arbitraryFontRegex.test(value)) {
                context.report({
                  node,
                  message: 'Avoid arbitrary font sizes. Use design tokens like text-sm, text-lg instead.',
                });
              }
            }
          }
        };
      }
    },
    
    // Enforce consistent spacing patterns
    'consistent-spacing': {
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.name.name === 'className' && node.value && node.value.type === 'Literal') {
              const value = node.value.value;
              
              // Check for inconsistent padding patterns
              if (value.includes('px-') && value.includes('py-')) {
                const pxMatch = value.match(/px-(\d+)/);
                const pyMatch = value.match(/py-(\d+)/);
                if (pxMatch && pyMatch && pxMatch[1] === pyMatch[1]) {
                  context.report({
                    node,
                    message: `Use p-${pxMatch[1]} instead of px-${pxMatch[1]} py-${pyMatch[1]} for consistent padding.`,
                  });
                }
              }
              
              // Check for redundant margin/padding combinations
              if (value.includes('mt-') && value.includes('pt-')) {
                context.report({
                  node,
                  message: 'Avoid combining margin-top and padding-top. Use consistent spacing approach.',
                });
              }
            }
          }
        };
      }
    },
    
    // Encourage use of component variants over custom styles
    'prefer-component-variants': {
      create(context) {
        return {
          JSXElement(node) {
            // Check for Button elements with custom styling instead of variants
            if (node.openingElement.name.name === 'button') {
              const classNameAttr = node.openingElement.attributes.find(
                attr => attr.name && attr.name.name === 'className'
              );
              
              if (classNameAttr && classNameAttr.value && classNameAttr.value.type === 'Literal') {
                const value = classNameAttr.value.value;
                
                // Check for button-like styling
                if (value.includes('bg-') && value.includes('text-') && value.includes('px-') && value.includes('py-')) {
                  context.report({
                    node,
                    message: 'Use Button component with variants instead of custom button styling.',
                  });
                }
              }
            }
          }
        };
      }
    }
  }
};

// Usage instructions:
// Add to your .eslintrc.js:
// {
//   "extends": ["./.eslintrc.design.js"],
//   "rules": {
//     "no-hardcoded-colors": "error",
//     "consistent-spacing": "warn",
//     "prefer-component-variants": "warn"
//   }
// }
