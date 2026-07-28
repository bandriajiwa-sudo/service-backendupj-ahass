const fs = require("fs");
const path = require("path");

function findFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findFiles(fullPath, files);
    } else if (fullPath.endsWith(".module.css")) {
      files.push(fullPath);
    }
  }
  return files;
}

const cssFiles = findFiles(
  "d:/Inventory-Service-Imformation-System/frontend/src/features",
);

const rules = [
  {
    regex: /\.metricValue\s*\{[^}]*\}/g,
    replace: `.metricValue {\n  font-size: 2.25rem;\n  font-weight: 800;\n  color: #0f2c4a;\n  line-height: 1.2;\n}`,
  },
  {
    regex: /\.pageTitle\s*\{[^}]*\}/g,
    replace: `.pageTitle {\n  font-size: 1.75rem;\n  font-weight: 700;\n  color: #1e293b;\n  margin-bottom: 0.25rem;\n}`,
  },
  {
    regex: /\.pageSubtitle\s*\{[^}]*\}/g,
    replace: `.pageSubtitle {\n  font-size: 0.875rem;\n  font-weight: 400;\n  color: #94a3b8;\n}`,
  },
  {
    regex: /\.cardTitle\s*\{[^}]*\}/g,
    replace: `.cardTitle {\n  font-size: 1.15rem;\n  font-weight: 600;\n  color: #1e293b;\n  margin-bottom: 1rem;\n}`,
  },
  {
    regex: /\.panelTitle\s*\{[^}]*\}/g,
    replace: `.panelTitle {\n  font-size: 1.15rem;\n  font-weight: 600;\n  color: #1e293b;\n  margin-bottom: 1rem;\n}`,
  },
  {
    regex: /\.metricTitle\s*\{[^}]*\}/g,
    replace: `.metricTitle {\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: #475569;\n}`,
  },
  {
    regex: /\.metricLabel\s*\{[^}]*\}/g,
    replace: `.metricLabel {\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: #475569;\n}`,
  },
  {
    regex: /\.metricSubtext\s*\{[^}]*\}/g,
    replace: `.metricSubtext {\n  font-size: 0.75rem;\n  font-weight: 400;\n  color: #94a3b8;\n  margin-top: 0.25rem;\n}`,
  },
];

cssFiles.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let original = content;

  rules.forEach((r) => {
    content = content.replace(r.regex, r.replace);
  });

  // also handle some nested classes like .cardHeaderFlex .cardTitle
  content = content.replace(
    /\.cardHeaderFlex\s*\.cardTitle\s*\{[^}]*\}/g,
    `.cardHeaderFlex .cardTitle {\n  font-size: 1.15rem;\n  font-weight: 600;\n  color: #1e293b;\n  margin-bottom: 1rem;\n}`,
  );

  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
