#!/usr/bin/env node

/**
 * 自动数据库配置脚本
 * 根据 DATABASE_PROVIDER 环境变量自动选择数据库类型
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置文件路径
const SCHEMA_DIR = path.join(__dirname, '..', 'prisma');
const MYSQL_SCHEMA = path.join(SCHEMA_DIR, 'schema.mysql.prisma');
const POSTGRES_SCHEMA = path.join(SCHEMA_DIR, 'schema.postgres.prisma');
const CURRENT_SCHEMA = path.join(SCHEMA_DIR, 'schema.prisma');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description, allowFail = false) {
  try {
    log(`🔄 ${description}...`, 'cyan');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description}完成`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description}失败`, 'red');
    if (allowFail) {
      log(`⚠️  ${description}失败，但继续执行...`, 'yellow');
      return false;
    } else {
      process.exit(1);
    }
  }
}

function copySchema(source, target) {
  try {
    fs.copyFileSync(source, target);
    log(`✅ 已复制 ${path.basename(source)} 到 ${path.basename(target)}`, 'green');
    return true;
  } catch (error) {
    log(`❌ 复制失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

function setupDatabase() {
  // 读取环境变量
  require('dotenv').config();
  const provider = process.env.DATABASE_PROVIDER || 'mysql';
  
  log('🚀 DMS 自动数据库配置', 'blue');
  log(`📊 检测到数据库类型: ${provider.toUpperCase()}`, 'cyan');
  
  let sourceSchema;
  
  switch (provider.toLowerCase()) {
    case 'postgres':
    case 'postgresql':
      log('🐘 配置PostgreSQL数据库...', 'blue');
      sourceSchema = POSTGRES_SCHEMA;
      break;
      
    case 'mysql':
      log('🐬 配置MySQL数据库...', 'blue');
      sourceSchema = MYSQL_SCHEMA;
      break;
      
    default:
      log(`❌ 不支持的数据库类型: ${provider}`, 'red');
      log('💡 支持的类型: mysql, postgres', 'yellow');
      process.exit(1);
  }
  
  // 检查源schema文件是否存在
  if (!fs.existsSync(sourceSchema)) {
    log(`❌ Schema文件不存在: ${sourceSchema}`, 'red');
    process.exit(1);
  }
  
  // 复制对应的schema文件
  copySchema(sourceSchema, CURRENT_SCHEMA);
  
  // 生成Prisma客户端
  runCommand('npx prisma generate', '生成Prisma客户端',false);
  
  // 推送数据库结构（允许失败，自动接受数据丢失）
  const dbPushSuccess = runCommand('npx prisma db push --accept-data-loss', '推送数据库结构', false);
  
  // 初始化数据库数据（只有在数据库推送成功时才执行）
  if (dbPushSuccess) {
    const initScript = path.join(__dirname, '..', 'server', 'utils', 'init-db.ts');
    if (fs.existsSync(initScript)) {
      runCommand('npx tsx server/utils/init-db.ts', '初始化数据库数据', false);
    } else {
      log('⚠️  初始化脚本不存在，跳过数据初始化', 'yellow');
    }
  } else {
    log('⚠️  数据库推送失败，跳过数据初始化', 'yellow');
  }
  
  log('🎉 数据库配置完成！', 'green');
}

// 检查是否安装了dotenv
try {
  require('dotenv');
} catch (error) {
  log('❌ 缺少 dotenv 依赖，正在安装...', 'yellow');
  try {
    execSync('npm install dotenv', { stdio: 'inherit' });
  } catch (installError) {
    log('❌ 安装 dotenv 失败，请手动安装: npm install dotenv', 'red');
    process.exit(1);
  }
}

// 运行主函数
setupDatabase(); 