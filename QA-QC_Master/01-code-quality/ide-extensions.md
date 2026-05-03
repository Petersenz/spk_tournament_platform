# IDE Extensions — VS Code / Cursor

> Extensions ที่แนะนำสำหรับ VS Code และ Cursor
> แบ่งเป็น Must-Have (ต้องมี) และ Recommended (แนะนำ)

---

## Must-Have Extensions (6 ตัว)

ต้องติดตั้งทุกตัว — เป็นส่วนหนึ่งของ quality pipeline

| #   | Extension           | ID                             | หน้าที่                                       | Free/Paid |
| --- | ------------------- | ------------------------------ | --------------------------------------------- | --------- |
| 1   | **ESLint**          | `dbaeumer.vscode-eslint`       | แสดง lint error/warning ขณะเขียน code         | Free      |
| 2   | **Prettier**        | `esbenp.prettier-vscode`       | Format code อัตโนมัติเมื่อ save               | Free      |
| 3   | **SonarLint**       | `sonarsource.sonarlint-vscode` | Real-time SAST + code smell detection         | Free      |
| 4   | **Aikido Security** | `aikidosec.aikido-security`    | Security scanning ใน IDE (SAST + SCA)         | Free      |
| 5   | **Error Lens**      | `usernamehw.errorlens`         | แสดง error/warning inline ติดกับบรรทัด code   | Free      |
| 6   | **YAML**            | `redhat.vscode-yaml`           | Validate YAML (docker-compose, CI/CD, config) | Free      |

### รายละเอียดแต่ละตัว

#### 1. ESLint (`dbaeumer.vscode-eslint`)

- แสดง ESLint errors/warnings ขณะเขียน code
- อ่าน config จาก `eslint.config.mjs` อัตโนมัติ
- Fix on save เมื่อเปิด setting

**Settings ที่แนะนำ:**

```json
{
  "eslint.useFlatConfig": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

#### 2. Prettier (`esbenp.prettier-vscode`)

- Format code เมื่อ save อัตโนมัติ
- อ่าน config จาก `.prettierrc` อัตโนมัติ

**Settings ที่แนะนำ:**

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[javascript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescriptreact]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[json]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }
}
```

#### 3. SonarLint (`sonarsource.sonarlint-vscode`)

- ตรวจ security vulnerabilities, bugs, code smells ขณะเขียน
- รองรับ Connected Mode กับ SonarQube server
- ดูรายละเอียดที่ [sonarqube.md](sonarqube.md)

#### 4. Aikido Security (`aikidosec.aikido-security`)

- สแกน SAST (static analysis) + SCA (dependency vulnerabilities) ใน IDE
- แสดง security issue พร้อม severity ขณะเขียน
- ไม่ต้อง sign up — ทำงาน local

#### 5. Error Lens (`usernamehw.errorlens`)

- แสดง error/warning message inline ติดกับบรรทัด code
- เห็นปัญหาทันทีไม่ต้อง hover
- รวม output จากทุก linter (ESLint, SonarLint, TypeScript)

#### 6. YAML (`redhat.vscode-yaml`)

- Validate YAML syntax + schema
- สำคัญสำหรับ: docker-compose.yml, .gitlab-ci.yml, .coderabbit.yaml
- Auto-complete ตาม schema

---

## Recommended Extensions (10 ตัว)

แนะนำสำหรับ productivity — ไม่บังคับแต่ช่วยได้มาก

| #   | Extension              | ID                                         | หน้าที่                                   | Free/Paid   |
| --- | ---------------------- | ------------------------------------------ | ----------------------------------------- | ----------- |
| 1   | **GitLens**            | `eamodio.gitlens`                          | ดู git blame, history, compare inline     | Free (core) |
| 2   | **Git Graph**          | `mhutchie.git-graph`                       | Visualize git branch graph                | Free        |
| 3   | **Docker**             | `ms-azuretools.vscode-docker`              | Manage Docker containers, images, compose | Free        |
| 4   | **Snyk Security**      | `snyk-security.snyk-vulnerability-scanner` | Deep SCA + vulnerability scanning         | Free        |
| 5   | **GitLab Workflow**    | `gitlab.gitlab-workflow`                   | GitLab MR/CI/CD integration ใน IDE        | Free        |
| 6   | **TODO Tree**          | `gruntfuggly.todo-tree`                    | หา TODO/FIXME/HACK ทั้ง project           | Free        |
| 7   | **REST Client**        | `humao.rest-client`                        | ทดสอบ API ใน IDE (แทน Postman)            | Free        |
| 8   | **Remote - SSH**       | `ms-vscode-remote.remote-ssh`              | เขียน code บน VPS ผ่าน SSH                | Free        |
| 9   | **Code Spell Checker** | `streetsidesoftware.code-spell-checker`    | ตรวจ typo ใน code + comments              | Free        |
| 10  | **Indent Rainbow**     | `oderwat.indent-rainbow`                   | แสดงสี indentation level                  | Free        |

### รายละเอียดที่น่าสนใจ

#### GitLens (`eamodio.gitlens`)

- แสดง git blame inline — เห็นว่าใครแก้บรรทัดนี้เมื่อไหร่
- Compare กับ branch อื่นได้
- ดู file history แบบ visual

#### Docker (`ms-azuretools.vscode-docker`)

- เห็น running containers ใน sidebar
- Start/stop/restart container จาก IDE
- ดู logs ของ container (เช่น SonarQube)

#### GitLab Workflow (`gitlab.gitlab-workflow`)

- สร้าง/review MR จากใน IDE
- ดู CI/CD pipeline status
- ดู issue tracker

#### TODO Tree (`gruntfuggly.todo-tree`)

- สแกนทั้ง project หา TODO, FIXME, HACK, XXX
- แสดงเป็น tree ใน sidebar
- สำคัญเพราะ SonarJS มี rule `sonarjs/todo-tag` ที่ตรวจ TODO

---

## วิธีติดตั้งทั้งหมดในที

### CLI (VS Code / Cursor)

```bash
# Must-Have (6 ตัว)
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension sonarsource.sonarlint-vscode
code --install-extension aikidosec.aikido-security
code --install-extension usernamehw.errorlens
code --install-extension redhat.vscode-yaml

# Recommended (10 ตัว)
code --install-extension eamodio.gitlens
code --install-extension mhutchie.git-graph
code --install-extension ms-azuretools.vscode-docker
code --install-extension snyk-security.snyk-vulnerability-scanner
code --install-extension gitlab.gitlab-workflow
code --install-extension gruntfuggly.todo-tree
code --install-extension humao.rest-client
code --install-extension ms-vscode-remote.remote-ssh
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension oderwat.indent-rainbow
```

> สำหรับ Cursor: เปลี่ยน `code` เป็น `cursor` ในคำสั่ง หรือติดตั้งผ่าน UI เหมือนกัน

### Workspace Recommendations (`.vscode/extensions.json`)

สร้างไฟล์ `.vscode/extensions.json` เพื่อให้ทีมเห็นแนะนำเมื่อเปิด project:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "sonarsource.sonarlint-vscode",
    "aikidosec.aikido-security",
    "usernamehw.errorlens",
    "redhat.vscode-yaml",
    "eamodio.gitlens",
    "mhutchie.git-graph",
    "ms-azuretools.vscode-docker",
    "gruntfuggly.todo-tree"
  ]
}
```

---

## Settings ที่แนะนำ — `.vscode/settings.json`

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.useFlatConfig": true,
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.autoSave": "onFocusChange",
  "editor.tabSize": 2,
  "editor.bracketPairColorization.enabled": true
}
```

---

## สรุป

| ประเภท      | จำนวน      | ราคารวม      | หน้าที่หลัก                                     |
| ----------- | ---------- | ------------ | ----------------------------------------------- |
| Must-Have   | 6 ตัว      | Free ทั้งหมด | Linting, formatting, security, error visibility |
| Recommended | 10 ตัว     | Free ทั้งหมด | Git, Docker, productivity, code quality         |
| **รวม**     | **16 ตัว** | **$0**       | **ครอบคลุม development workflow ทั้งหมด**       |
