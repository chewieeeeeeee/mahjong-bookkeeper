# 麻将记账助手

微信聊天框记麻将输赢，月底年底复盘胜率和盈亏。

---

## 使用方法

在微信里打开你的测试号，发消息：

| 发送内容 | 效果 |
|---|---|
| `+500` | 赢了500 |
| `-200` | 输了200 |
| `+300 老张` | 赢了300，备注"老张" |
| `今天` | 今日战绩（胜率+盈亏） |
| `本月` | 本月战绩汇总 |
| `今年` | 年度战绩汇总 |
| `最近` | 最近10场 |
| `删 +500` | 删除最近一笔+500 |
| `帮助` | 查看说明 |

### 汇总回复示例

```
本月战绩：
  场次: 12场
  赢: 7场  输: 5场
  胜率: 58.3%
  总盈亏: +1500
  场均: +125
```

---

## 部署步骤

### 第1步：注册微信测试号

1. 打开 https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login
2. 微信扫二维码登录
3. 记下 **appID** 和 **appsecret**
4. 页面下方扫码关注你的测试号

### 第2步：创建 MongoDB 数据库

1. 打开 https://www.mongodb.com/cloud/atlas/register 注册
2. 创建免费集群（M0，默认配置即可）
3. 创建后点「Connect」→「Drivers」，复制连接字符串
4. 把连接字符串里的 `<password>` 替换成你设的密码
5. 记下这个连接字符串

### 第3步：部署到 Vercel

1. 去 https://github.com 注册，创建仓库 `mahjong-bookkeeper`
2. 把本项目代码上传到 GitHub
3. 打开 https://vercel.com ，用 GitHub 登录
4. 导入仓库，添加环境变量：
   - `MONGODB_URI` = 第2步的连接字符串
   - `WECHAT_TOKEN` = 自己设一个随机字符串，如 `mytoken123`
5. 点 Deploy，记下域名

### 第4步：配置微信测试号

1. 回测试号页面，填：
   - URL: `https://你的域名.vercel.app/api/wechat`
   - Token: 第3步设的 `WECHAT_TOKEN`
2. 点提交，显示「配置成功」即可
