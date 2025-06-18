#!/usr/bin/env node

/**
 * 数据库Schema验证脚本
 * 验证MySQL和PostgreSQL两个schema文件的一致性
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'blue');
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description}完成`, 'green');
    return { success: true, output };
  } catch (error) {
    log(`❌ ${description}失败: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

function checkFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`❌ 文件不存在: ${filePath}`, 'red');
    return false;
  }
  return true;
}

function validateSchemas() {
  log('🚀 开始验证数据库Schema文件', 'bold');
  console.log();

  // 检查文件是否存在
  const mysqlSchema = 'prisma/schema.mysql.prisma';
  const postgresSchema = 'prisma/schema.postgres.prisma';
  
  if (!checkFileExists(mysqlSchema) || !checkFileExists(postgresSchema)) {
    process.exit(1);
  }

  let hasErrors = false;

  // 验证MySQL schema（需要临时设置MySQL URL）
  log('📋 步骤1: 验证MySQL Schema语法', 'yellow');
  const mysqlResult = runCommand(
    `DATABASE_URL="mysql://temp:temp@localhost:3306/temp" npx prisma validate --schema=${mysqlSchema}`,
    '验证MySQL Schema'
  );
  if (!mysqlResult.success) {
    hasErrors = true;
  }

  // 验证PostgreSQL schema（需要临时设置PostgreSQL URL）
  log('📋 步骤2: 验证PostgreSQL Schema语法', 'yellow');
  const postgresResult = runCommand(
    `DATABASE_URL="postgresql://temp:temp@localhost:5432/temp" npx prisma validate --schema=${postgresSchema}`,
    '验证PostgreSQL Schema'
  );
  if (!postgresResult.success) {
    hasErrors = true;
  }

  // 检查结构差异
  log('📋 步骤3: 检查两个Schema的结构差异', 'yellow');
  try {
    // 读取两个schema文件内容进行规范化比较
    const mysqlContent = fs.readFileSync(mysqlSchema, 'utf8');
    const postgresContent = fs.readFileSync(postgresSchema, 'utf8');
    
    // 规范化内容：移除数据库特定的类型和注释
    function normalizeSchema(content) {
      return content
        .replace(/provider = "mysql"/g, 'provider = "DATABASE"')
        .replace(/provider = "postgresql"/g, 'provider = "DATABASE"')
        .replace(/This is your Prisma schema file,/g, 'This is your Prisma schema file for DATABASE,')
        .replace(/This is your Prisma schema file for PostgreSQL,/g, 'This is your Prisma schema file for DATABASE,')
        .replace(/@db\.TinyInt/g, '') // 移除MySQL特有的TinyInt
        .replace(/@db\.LongText/g, '@db.Text') // 统一为Text
        .replace(/@db\.MediumText/g, '@db.Text') // 统一为Text
        .replace(/\s+/g, ' ') // 标准化空白字符
        .trim();
    }
    
    const normalizedMysql = normalizeSchema(mysqlContent);
    const normalizedPostgres = normalizeSchema(postgresContent);
    
    if (normalizedMysql === normalizedPostgres) {
      log('✅ 结构差异检查通过（仅已知的数据库类型映射差异）', 'green');
    } else {
      // 显示实际差异
      try {
        const diffOutput = execSync(`diff -u ${mysqlSchema} ${postgresSchema}`, { encoding: 'utf8' });
        log('⚠️  发现结构差异，请检查:', 'yellow');
        console.log(diffOutput);
      } catch (diffError) {
        if (diffError.status === 1) {
          console.log(diffError.stdout);
        }
      }
      hasErrors = true;
    }
  } catch (error) {
    log(`❌ 差异检查失败: ${error.message}`, 'red');
    hasErrors = true;
  }

  // 统计模型数量
  log('📋 步骤4: 统计模型数量', 'yellow');
  try {
    const mysqlContent = fs.readFileSync(mysqlSchema, 'utf8');
    const postgresContent = fs.readFileSync(postgresSchema, 'utf8');
    
    const mysqlModels = (mysqlContent.match(/^model\s+\w+\s*{/gm) || []).length;
    const postgresModels = (postgresContent.match(/^model\s+\w+\s*{/gm) || []).length;
    
    log(`MySQL模型数量: ${mysqlModels}`, 'blue');
    log(`PostgreSQL模型数量: ${postgresModels}`, 'blue');
    
    if (mysqlModels === postgresModels) {
      log('✅ 模型数量一致', 'green');
    } else {
      log('❌ 模型数量不一致', 'red');
      hasErrors = true;
    }
  } catch (error) {
    log(`❌ 模型统计失败: ${error.message}`, 'red');
    hasErrors = true;
  }

  console.log();
  if (hasErrors) {
    log('❌ Schema验证失败，请修复上述问题后重试', 'red');
    log('💡 参考文档: .cursor/rules/develop/d-database-schema-sync.mdc', 'yellow');
    process.exit(1);
  } else {
    log('🎉 所有Schema验证通过！', 'green');
    log('✅ MySQL和PostgreSQL架构保持一致', 'green');
  }
}

// 主函数
if (require.main === module) {
  validateSchemas();
}

module.exports = { validateSchemas }; 