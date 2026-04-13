const fs = require('fs');

function replaceAlerts(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import if not exists
  if (!content.includes("import toast")) {
    content = content.replace("import React", "import toast from 'react-hot-toast';\nimport React");
  }

  // Replace alert('...erro...') with toast.error
  content = content.replace(/alert\((['"`].*?[eE]rro.*['"`])\)/g, 'toast.error($1)');
  content = content.replace(/alert\((['"`].*?[fF]alha.*['"`])\)/g, 'toast.error($1)');
  content = content.replace(/alert\((['"`].*?inválido.*['"`])\)/g, 'toast.error($1)');
  
  // Replace alert('...sucesso...') with toast.success
  content = content.replace(/alert\((['"`].*?[sS]ucesso.*['"`])\)/g, 'toast.success($1)');
  content = content.replace(/alert\((['"`].*?[cC]oncluído.*['"`])\)/g, 'toast.success($1)');
  content = content.replace(/alert\((['"`].*?[fF]inalizad.*['"`])\)/g, 'toast.success($1)');
  
  // Replace remaining alert(...) with toast(...)
  content = content.replace(/alert\(/g, 'toast(');

  fs.writeFileSync(filePath, content, 'utf8');
}

replaceAlerts('src/App.tsx');
replaceAlerts('src/components/Feed.tsx');
