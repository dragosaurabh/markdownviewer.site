// ===================================
// Editor Templates - Template System
// ===================================

const TEMPLATES = {
  'blog-post': {
    name: 'Blog Post',
    description: 'SEO-optimized blog post template',
    icon: '📝',
    content: `# Your Compelling Title Here

> **Meta Description**: Write a compelling 150-160 character description that summarizes your post and includes your main keyword.

## Introduction

Start with a hook that grabs attention. State the problem or question you'll address. Make it clear why readers should care about this topic.

## Main Content

### Key Point 1: [Your First Main Point]

Explain your first key point in detail. Use examples, data, or stories to illustrate your point. Break complex ideas into digestible chunks.

- Important detail 1
- Important detail 2
- Important detail 3

### Key Point 2: [Your Second Main Point]

Continue with your second major point. Maintain a logical flow from the previous section.

\`\`\`javascript
// Add code examples if relevant
const example = "Code makes technical content more valuable";
\`\`\`

### Key Point 3: [Your Third Main Point]

Round out your main content with additional insights or perspectives.

## Key Takeaways

- **Takeaway 1**: Brief summary of first main point
- **Takeaway 2**: Brief summary of second main point
- **Takeaway 3**: Brief summary of third main point

## Conclusion

Summarize your main points and provide a clear call-to-action. What should readers do next?

---

**Related Articles:**
- [Link to related content]
- [Link to related content]

**Tags**: #keyword1 #keyword2 #keyword3`
  },
  
  'readme': {
    name: 'README.md',
    description: 'Professional README for GitHub projects',
    icon: '📦',
    content: `# Project Name

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com)

> One-sentence description of what your project does

## ✨ Features

- 🚀 Feature 1 - Brief description
- 💡 Feature 2 - Brief description
- 🎨 Feature 3 - Brief description
- ⚡ Feature 4 - Brief description

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js 14.x or higher
- npm 6.x or higher
- [Any other requirements]

## 🚀 Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/project-name.git

# Navigate to project directory
cd project-name

# Install dependencies
npm install
\`\`\`

## 💻 Usage

\`\`\`javascript
const project = require('project-name');

// Basic usage example
project.doSomething();
\`\`\`

### Advanced Usage

\`\`\`javascript
// More complex example
const result = project.advancedFeature({
  option1: 'value1',
  option2: 'value2'
});
\`\`\`

## 📖 Documentation

Full documentation is available at [link to docs]

## 🧪 Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
\`\`\`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- References`
  },
  
  'documentation': {
    name: 'Technical Documentation',
    description: 'Comprehensive documentation template',
    icon: '📚',
    content: `# [Component/Feature Name] Documentation

## Overview

Brief description of what this component/feature does and why it exists.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Installation

### Prerequisites

- Requirement 1
- Requirement 2
- Requirement 3

### Installation Steps

\`\`\`bash
# Step 1: Install package
npm install package-name

# Step 2: Additional setup
npm run setup
\`\`\`

## Quick Start

Get up and running in 5 minutes:

\`\`\`javascript
// 1. Import the package
const Package = require('package-name');

// 2. Initialize
const instance = new Package({
  option: 'value'
});

// 3. Use it
instance.doSomething();
\`\`\`

## Configuration

### Basic Configuration

\`\`\`javascript
const config = {
  option1: 'value1',
  option2: 'value2',
  option3: true
};
\`\`\`

### Advanced Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| option1 | string | 'default' | Description of option1 |
| option2 | number | 100 | Description of option2 |
| option3 | boolean | false | Description of option3 |

## API Reference

### Class: ClassName

Main class description.

#### Constructor

\`\`\`javascript
new ClassName(options)
\`\`\`

**Parameters:**
- \`options\` (Object): Configuration options
  - \`option1\` (string): Description
  - \`option2\` (number): Description

#### Methods

##### methodName(param1, param2)

Description of what this method does.

**Parameters:**
- \`param1\` (Type): Description
- \`param2\` (Type): Description

**Returns:** (Type) Description of return value

**Example:**
\`\`\`javascript
const result = instance.methodName('value1', 'value2');
console.log(result);
\`\`\`

## Examples

### Example 1: Basic Usage

\`\`\`javascript
// Description of what this example demonstrates
const example = new Package();
example.doSomething();
\`\`\`

### Example 2: Advanced Usage

\`\`\`javascript
// More complex example
const advanced = new Package({
  advanced: true,
  options: {
    nested: 'value'
  }
});

advanced.complexOperation()
  .then(result => console.log(result))
  .catch(error => console.error(error));
\`\`\`

## Troubleshooting

### Common Issue 1

**Problem:** Description of the problem

**Solution:** Steps to resolve:
1. Step 1
2. Step 2
3. Step 3

### Common Issue 2

**Problem:** Description of the problem

**Solution:** Explanation of how to fix it

## FAQ

### Question 1?

Answer to question 1.

### Question 2?

Answer to question 2.

## Additional Resources

- [Official Website](https://example.com)
- [API Documentation](https://docs.example.com)
- [GitHub Repository](https://github.com/example/repo)
- [Community Forum](https://forum.example.com)

## Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our server](https://discord.gg/example)
- 🐛 Issues: [GitHub Issues](https://github.com/example/repo/issues)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.`
  },
  
  'article': {
    name: 'Technical Article',
    description: 'In-depth technical article template',
    icon: '📄',
    content: `# [Article Title]: [Subtitle]

*Published: [Date] | Reading Time: [X] minutes | Author: [Your Name]*

## TL;DR

Quick summary of the article in 2-3 sentences for readers who want the key points.

## Introduction

### The Problem

Describe the problem or challenge this article addresses. Make it relatable and clear why it matters.

### What You'll Learn

- Key learning point 1
- Key learning point 2
- Key learning point 3

## Background

Provide necessary context and background information. Explain concepts that readers need to understand before diving into the main content.

## The Solution

### Approach 1: [Method Name]

Detailed explanation of the first approach.

**Pros:**
- Advantage 1
- Advantage 2

**Cons:**
- Disadvantage 1
- Disadvantage 2

\`\`\`javascript
// Code example demonstrating this approach
function example() {
  return "Implementation details";
}
\`\`\`

### Approach 2: [Method Name]

Detailed explanation of the second approach.

**Pros:**
- Advantage 1
- Advantage 2

**Cons:**
- Disadvantage 1
- Disadvantage 2

\`\`\`javascript
// Code example for second approach
function alternative() {
  return "Different implementation";
}
\`\`\`

## Implementation Guide

### Step 1: [First Step]

Detailed instructions for the first step.

\`\`\`bash
# Commands or code for step 1
npm install package
\`\`\`

### Step 2: [Second Step]

Detailed instructions for the second step.

### Step 3: [Third Step]

Detailed instructions for the third step.

## Best Practices

1. **Practice 1**: Explanation
2. **Practice 2**: Explanation
3. **Practice 3**: Explanation

## Common Pitfalls

### Pitfall 1

Description of what to avoid and why.

### Pitfall 2

Description of another common mistake.

## Performance Considerations

Discuss performance implications, benchmarks, or optimization tips.

## Conclusion

Summarize the key points and provide final thoughts or recommendations.

### Key Takeaways

- Important point 1
- Important point 2
- Important point 3

### Next Steps

What readers should do next to apply this knowledge.

## References

1. [Reference 1](https://example.com)
2. [Reference 2](https://example.com)
3. [Reference 3](https://example.com)

---

*Have questions or feedback? Leave a comment below or reach out on [Twitter](https://twitter.com/yourhandle).*`
  }
};

class EditorTemplates {
  constructor(editorCore) {
    this.core = editorCore;
    this.templateGrid = document.getElementById('template-grid');
  }
  
  init() {
    console.log('[Templates] Initializing...');
    this.loadTemplateGrid();
  }
  
  loadTemplateGrid() {
    if (!this.templateGrid) return;
    
    const html = Object.entries(TEMPLATES).map(([id, template]) => `
      <div class="template-card" data-template-id="${id}">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${template.icon}</div>
        <h3>${template.name}</h3>
        <p>${template.description}</p>
      </div>
    `).join('');
    
    this.templateGrid.innerHTML = html;
    
    // Add click handlers
    this.templateGrid.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        const templateId = card.dataset.templateId;
        this.loadTemplate(templateId);
      });
    });
  }
  
  loadTemplate(id) {
    const template = TEMPLATES[id];
    if (!template) {
      console.error('[Templates] Template not found:', id);
      return;
    }
    
    if (this.core.getValue().trim() !== '') {
      if (!confirm('This will replace your current content. Continue?')) {
        return;
      }
    }
    
    this.core.setValue(template.content);
    
    // Close modal
    const modal = document.getElementById('template-modal');
    if (modal) modal.classList.remove('show');
    
    showToast(`Template "${template.name}" loaded`, 'success');
  }
  
  getTemplates() {
    return TEMPLATES;
  }
}

// Make available globally
window.EditorTemplates = EditorTemplates;
window.TEMPLATES = TEMPLATES;
