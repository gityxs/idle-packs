/*

 @name    : 锅巴汉化 - Web汉化插件
 @author  : 麦子、JAR、小蓝、好阳光的小锅巴
 @version : V0.6.1 - 2019-07-09
 @website : http://www.g8hh.com
 @idle games : http://www.gityx.com
 @QQ Group : 627141737

*/

//1.汉化杂项
var cnItems = {
    _OTHER_: [],

    //未分类：
    'Save': '保存',
    'Export': '导出',
    'Import': '导入',
    'Settings': '设置',
    'Achievements': '成就',
    'Statistics': '统计',
    'Changelog': '更新日志',
    'Hotkeys': '快捷键',
    'ALL': '全部',
    'Default': '默认',
    'AUTO': '自动',
    'default': '默认',
    "points": "点数",
    "Reset for +": "重置得到 + ",
    "Currently": "当前",
    "Effect": "效果",
    "Cost": "成本",
    "Goal:": "目标:",
    "Reward": "奖励",
    "Start": "开始",
    "Exit Early": "提前退出",
    "Finish": "完成",
    "Milestone Gotten!": "获得里程碑！",
    "Milestones": "里程碑",
    "Completed": "已完成",
    "Default Save": "默认存档",
    "Delete": "删除",
    "No": "否",
    "Saves": "存档",
    "Options": "选项",
    "Yes": "是",
    "Are you sure?": "你确定吗？",
    "Edit Name": "编辑名称",
    "Info": "信息",
    "Currently:": "当前:",
    "Appearance": "外观",
    "How the game looks.": "游戏看起来如何。",
    "Theme": "主题",
    "Show milestones": "显示里程碑",
    "Show TPS meter at the bottom-left corner of the page.": "在页面左下角显示 TPS。",
    "Show TPS": "显示 TPS",
    "None": "无",
    "Align modifier units": "对齐概览单位",
    "Align numbers to the beginning of the unit in modifier view.": "在概览视图中将数字与单元的开头对齐。",
    "Select which milestones to display based on criterias.": "根据标准选择要显示的里程碑。",
    "All": "全部",
    "Classic": "经典",
    "Configurable": "可配置",
    "Duplicate": "复制",
    "Mute": "静音",
    "Unmute": "播放",
    "Join the Discord!": "加入 Discord!",
    "Buy": "购买",
    "Download Save": "下载存档",
    "Inventory": "库存",
    "Max": "最大",
    "Reset Game": "重置游戏",
    "Shop": "商店",
    "Upgrades": "升级",
    "Upload Save": "导入存档",
    "Your Packs": "你的卡包",
    "No packs owned": "未拥有卡包",
    "Packs": "卡包",
    "Backup Reminder": "备份提醒",
    "Boss Fights": "首领战斗",
    "Buy me a coffee": "请作者喝杯咖啡",
    "Details": "详情",
    "Collection": "收藏品",
    "Equip an item with combat stats to unlock boss fights": "装备带有战斗属性的物品来解锁与Boss的战斗",
    "Idle Pack Opening Game": "开盒抽卡放置游戏",
    "Please download a backup of your save file to prevent progress loss.": "请下载存档文件的备份以防止进度丢失。",
    "Show Animations": "显示动画",
    "(Open a pack first)": "(请先购买并打开一个卡包)",
    "Auto-Buyer": "自动购买器",
    "Efficiency": "效率",
    "Instant Reset": "瞬间重置",
    "Capacity": "容量",
    "Ancient Pack": "远古包",
    "Cyber Pack": "赛博包",
    "Fakemon Pack": "假人包",
    "Morty Pack": "莫蒂包",
    "Mythical Pack": "神话包",
    "Maxed": "已最大",
    "Filter:": "过滤器:",
    "Available": "可用",
    "All Types": "所有类型",
    "Combat Items": "战斗物品",
    "Equipment": "装备",
    "Equipment Slot": "装备槽",
    "General": "常规",
    "Pack Storage": "卡包存储",
    "Production": "生产",
    "Rarity": "稀有度",
    "Purchase": "购买",
    "Sort by:": "排序方式:",
    "Value": "价值",
    "No items in inventory": "库存中暂无物品",
    "Add another equipment slot": "添加另一个装备槽",
    "Advanced Equipment Slot": "高级装备槽",
    "Increase maximum pack storage by 5": "增加最大卡包存储 5",
    "Increase purchase limit of Ancient Civilization Pack by 2": "远古文明包的购买上限增加2个",
    "Increase purchase limit of Cyber Temple Pack by 2": "网络神庙包的购买上限增加2个",
    "Increase purchase limit of Fakemon Pack by 2": "幻兽包的购买上限增加2个",
    "Increase purchase limit of Morty Pack by 2": "莫蒂礼包购买次数增加2次",
    "Increase purchase limit of Mythical Pack by 2": "增加神话包的购买限制2个",
    "Reduce Ancient Civilization Pack reset time by 10%": "远古文明包的重置时间减少10%",
    "Reduce Cyber Temple Pack reset time by 10%": "赛博神庙礼包的重置时间减少10%",
    "Reduce Fakemon Pack reset time by 10%": "幻兽包的重置时间减少10%",
    "Reduce Morty Pack reset time by 10%": "莫蒂包的重置时间减少10%",
    "Reduce Mythical Pack reset time by 10%": "神话包的重置时间减少10%",
    "Remove time restriction completely": "完全取消时间限制",
    "Requires Ancient Pack Efficiency level 9": "需要远古包效率等级9",
    "Requires Cyber Pack Efficiency level 9": "需要赛博包效率等级9",
    "Requires Fakemon Pack Efficiency level 9": "要求幻兽包效率等级9",
    "Requires Morty Pack Efficiency level 9": "需要莫蒂包效率等级9",
    "Unlock automatic purchasing for Ancient Civilization Pack": "解锁远古文明包的自动购买",
    "Unlock automatic purchasing for Cyber Temple Pack": "解锁赛博神庙包的自动购买",
    "Unlock automatic purchasing for Fakemon Pack": "解锁幻兽包的自动购买",
    "Unlock automatic purchasing for Morty Pack": "解锁莫蒂包的自动购买",
    "Unlock automatic purchasing for Mythical Pack": "解锁神话包的自动购买",
    "Upgrades are locked until you sell or equip your first item": "升级是锁定的，直到你出售或装备你的第一件物品",
    "Coins": "金币",
    "Collector": "收藏家",
    "Daily": "日常",
    "Daily Collector": "日常收藏家",
    "Items": "物品",
    "Wealthy": "富有",
    "Visual Settings": "视觉设置",
    "Total Bonuses:": "累计加成：",
    "Save Management": "保存管理",
    "Pack Opener": "开盒专家",
    "⚔️ Combat Locked": "⚔️ 战斗未解锁",
    "Done": "完成",
    "Open All": "全部打开",
    "Next": "下一个",
    "Skip": "跳过",
    "Tip: You can disable animations in settings for faster pack openings": "提示：您可以在设置中禁用动画以更快地打开卡包",
    "Total Value:": "总价值:",
    "Attack": "攻击",
    "Defense": "防御",
    "Equip": "装备",
    "Fakemon": "幻兽",
    "Health": "生命值",
    "Lock Item": "锁定物品",
    "Never": "从不",
    "Squanchy's Laser Collar": "史奇的激光项圈",
    "\"Pickle\" Experiment": "\“泡菜\”实验",
    "Auto Progress": "自动进度",
    "DEF": "防御",
    "HP": "生命值",
    "No Slots": "无槽位",
    "Rick": "叠加",
    "Select Boss Level:": "选择首领等级:",
    "Start Fighting": "开始战斗",
    "Unequip": "脱下",
    "Your Health": "你的生命值",
    "Your Stats": "你的属性",
    "Already Equipped": "已装备",
    "Boss Defeated!": "首领被击败！",
    "Stop Fighting": "停止战斗",
    "Can do!: +10% coin production": "能行！：+10%的金币产量",
    "Collection Bonuses:": "收藏品加成:",
    "Knowledge is power: +10% item value": "知识就是力量：+10%物品价值",
    "Look at me!: +15% item value": "看着我！：+15%的物品价值",
    "Study harder: +5% coin production": "更努力的学习：+5%的金币产量",
    "Auto Buy": "自动购买",
    "Maximum Level Reached": "已达到最大等级",
    "Open Another": "打开另一个",
    "ATK": "攻击",
    "coin production": "金币生产",
    "Synergy Effects:": "协同效果",
    "+15% per Fakemon item": "+15% 每个幻兽物品",
    "+20% per Rick or Morty item": "+20% 每个叠加或莫蒂物品",
    "Dimensional efficiency: +15% coin production": "次元效率：金币产量+15%",
    "Infinite possibilities: +20% item value": "无限可能：+20%的物品价值",
    "Dragon": "龙",
    "+15% per Dragon or Mythical item": "+15%每条龙或神话物品",
    "Ancient": "远古",
    "Aztec Calendar Disc": "阿兹特克日历圆盘",
    "Carved Ziggurat Stone": "雕刻的金字形神石",
    "Pixie Dust": "精灵之尘",
    "Rosetta Stone Fragment": "罗塞塔石碑碎片",
    "Basilisk Eye": "蛇怪之眼",
    "Centaur Bow": "半人马弓",
    "Gorgon Hair Strand": "蛇女发丝",
    "Kraken Ink": "海妖墨水",
    "Labyrinth Key": "迷宫钥匙",
    "Leprechaun Coin": "小妖精的金币",
    "Sphinx Riddle Stone": "斯芬克斯之谜石",
    "Ancient power: +58% coin production": "远古力量：增加58%的金币产量",
    "Ancient wisdom: +42% coin production": "远古智慧：金币产量+42%",
    "Babylonian Clay Tablet": "巴比伦泥板",
    "Crystal clarity: +20% item value": "水晶清晰度：增加20%物品价值",
    "Crystalline focus: +12% coin production": "水晶聚焦：增加12%的金币产量",
    "Golden age: +60% item value": "黄金时代：增加60%的物品价值",
    "Lost civilization: +55% item value": "失落的文明：增加55%的物品价值",
    "Mayan Jade Dagger": "玛雅玉匕首",
    "Olmec Head Shard": "奥尔梅克人头碎片",
    "Petrifying gaze: +45% item value": "石化凝视：+45%物品价值",
    "Riddle master: +48% item value": "谜语大师：增加48%的物品价值",
    "Serpent wisdom: +38% coin production": "蛇的智慧：增加38%的金币产量",
    "Time mastery: +65% coin production": "时间掌握：增加65%的金币产量",
    "Contents": "内容",
    "+20% per Ancient or Mystical item": "每件远古或神秘物品+20%",
    "+25% per Ancient or Colony item": "每件远古或殖民地物品+25%",
    "+25% per Dragon item": "每条龙+25%",
    "+30% per Mythical item": "每件神话物品+30%",
    "Astragonia": "黄芪",
    "Binary Obelisk Shard": "二进制方尖碑碎片",
    "Cosmic power: +30% coin production": "宇宙力量：增加30%金币产量",
    "Data Hieroglyph Crystal": "数据象形水晶",
    "Djinn Lamp": "神灵灯",
    "Dracelium": "龙兽",
    "Dragon's hoard: +30% item value": "龙之宝藏：增加30%物品价值",
    "Dragon's might: +25% coin production": "龙的力量：增加25%的金币产量",
    "Eternal flame: +35% coin production": "永恒之火：增加35%金币产量",
    "Infinite wishes: +58% item value": "无限愿望：+58%物品价值",
    "Kelpie Horseshoe": "凯尔派马蹄石",
    "Magical fortune: +54% coin production": "魔法财富：增加54%的金币产量",
    "Matrix Tablet": "矩阵的平板电脑",
    "Mermaid Tear": "美人鱼眼泪",
    "Mystical": "神秘",
    "Nano-Tech Scarab": "纳米科技圣甲虫",
    "Ocean's blessing: +45% item value": "海洋祝福：+45%物品价值",
    "Phoenix Feather": "凤凰羽毛",
    "Quantum Neural Processor": "量子神经处理器",
    "Rebirth riches: +40% item value": "重生财富：增加40%物品价值",
    "Siren Shell": "塞壬壳",
    "Stellar worth: +35% item value": "星体价值：+35%物品价值",
    "Tidal fortune: +40% coin production": "潮汐财富：增加40%金币产量",
    "Unicorn Horn": "独角兽的角",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "Oracle's Goblet": "神谕圣杯",
    "Eye of Horus Amulet": "荷鲁斯之眼护身符",
    "Dragon Scale": "龙鳞",
    "Faun Flute": "牧神长笛",
    "Griffin Claw": "格里芬爪",
    "Hydra Fang": "九头蛇牙",
    "Pegasus Feather": "天马羽",
    "Pyroqueen": "炎女王",
    "Wyvern Wing Membrane": "飞龙翼膜",
    "Yeti Fur": "雪人毛皮",
    "Salamander Ember": "沙罗曼蛇",
    "Mythical": "神话",
    "Minotaur Horn": "牛头怪的角",
    "Manticore Mane": "刺尾狮",
    "Fairy Lantern": "仙女灯笼",
    "Colony": "蜂群",
    "Terracottaur": "兵马俑",
    "Crystallus": "水晶",
    "Portal Gun": "传送枪",
    "Sparkynx": "斯帕克诺斯",
    " (Genuine)": " (正品)",
    "Morty": "莫蒂",
    "Leafling": "叶灵",
    "Bubbird": "泡泡鸟",
    "Morty's Math Book": "莫蒂的数学书",
    " (Broken)": "（坏掉了）",
    "Flickit": "闪烁",
    "Embermouse": "灰烬鼠",
    "Cronenberg Sample": "克罗嫩伯格样本",
    "Scruffy Plasma Pistol": "破旧的等离子手枪",
    "Portal Fluid Flask": "传送液体烧瓶",
    "Interdimensional Cable Remote": "次元电缆遥控器",
    "Dream Eater": "噬梦者",
    "Chromatic Egg": "彩色蛋",
    "uncommon": "罕见",
    "epic": "史诗",
    "legendary": "传说",
    "rare": "稀有",
    "common": "普通",
    "Fakemon Pack": "幻兽包",
    "Cyber Temple Pack": "赛博神庙包",
    "Ancient Civilization Pack": "远古文明包",
    "Mythical Creatures Pack": "神话生物包",
    "Morty Pack": "莫蒂包",
    "Daily Pack": "日常包",
    // 图标代码，不能汉化
    "Jacorb's Games": "Jacorb's Games",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "Scientific": "科学计数法",
    "Standard": "标准",
    "Blind": "盲文",
    "Letters": "字母",
    "Mixed Engineering": "混合工程",
    "Mixed Scientific": "混合科学",
    "Chemistry": "化学",
    "Engineering": "工程符号",
    "By Jacorb90": "By Jacorb90",
    "content_copy": "content_copy",
    "library_books": "library_books",
    "discord": "discord",
    "drag_handle": "drag_handle",
    "edit": "edit",
    "forum": "forum",
    "content_paste": "content_paste",
    "delete": "delete",
    "info": "info",
    "settings": "settings",
    'Twitter': 'Twitter',
    "Discord": "Discord",
    "Facebook": "Facebook",
    "Instagram": "Instagram",
    "gityxcom": "gityxcom",
    "Footer": "Footer",
    "Wiki": "Wiki",
    "gityx": "gityx",

    //树游戏
    'Loading...': '加载中...',
    'ALWAYS': '一直',
    'HARD RESET': '硬重置',
    'Export to clipboard': '导出到剪切板',
    'INCOMPLETE': '不完整',
    'HIDDEN': '隐藏',
    'AUTOMATION': '自动',
    'NEVER': '从不',
    'ON': '打开',
    'OFF': '关闭',
    'SHOWN': '显示',
    'Play Again': '再次游戏',
    'Keep Going': '继续',
    'The Modding Tree Discord': '模型树Discord',
    'You have': '你有',
    'It took you {{formatTime(player.timePlayed)}} to beat the game.': '花费了 {{formatTime(player.timePlayed)}} 时间去通关游戏.',
    'Congratulations! You have reached the end and beaten this game, but for now...': '恭喜你！ 您已经结束并通关了本游戏，但就目前而言...',
    'Main Prestige Tree server': '主声望树服务器',
    'Reach {{formatWhole(ENDGAME)}} to beat the game!': '达到 {{formatWhole(ENDGAME)}} 去通关游戏!',
    "Loading... (If this takes too long it means there was a serious error!": "正在加载...（如果这花费的时间太长，则表示存在严重错误！",
    'Loading... (If this takes too long it means there was a serious error!)←': '正在加载...（如果时间太长，则表示存在严重错误！）←',
    'Main\n\t\t\t\tPrestige Tree server': '主\n\t\t\t\t声望树服务器',
    'The Modding Tree\n\t\t\t\t\t\t\tDiscord': '模型树\n\t\t\t\t\t\t\tDiscord',
    'Please check the Discord to see if there are new content updates!': '请检查 Discord 以查看是否有新的内容更新！',
    'aqua': '水色',
    'AUTOMATION, INCOMPLETE': '自动化，不完整',
    'LAST, AUTO, INCOMPLETE': '最后，自动，不完整',
    'NONE': '无',
    'P: Reset for': 'P: 重置获得',
    'Git游戏': 'Git游戏',
    'QQ群号': 'QQ群号',
    'x': 'x',
    'QQ群号:': 'QQ群号:',
    '* 启用后台游戏': '* 启用后台游戏',
    '更多同类游戏:': '更多同类游戏:',
    'i': 'i',
    'I': 'I',
    'II': 'II',
    'III': 'III',
    'IV': 'IV',
    'V': 'V',
    'VI': 'VI',
    'VII': 'VII',
    'VIII': 'VIII',
    'X': 'X',
    'XI': 'XI',
    'XII': 'XII',
    'XIII': 'XIII',
    'XIV': 'XIV',
    'XV': 'XV',
    'XVI': 'XVI',
    'A': 'A',
    'B': 'B',
    'C': 'C',
    'D': 'D',
    'E': 'E',
    'F': 'F',
    'G': 'G',
    'H': 'H',
    'I': 'I',
    'J': 'J',
    'K': 'K',
    'L': 'L',
    'M': 'M',
    'N': 'N',
    'O': 'O',
    'P': 'P',
    'Q': 'Q',
    'R': 'R',
    'S': 'S',
    'T': 'T',
    'U': 'U',
    'V': 'V',
    'W': 'W',
    'X': 'X',
    'Y': 'Y',
    'Z': 'Z',
    '<': '<',
    '<<': '<<',
    '>': '>',
    '>>': '>>',
    'Jan': '1月',
    'Feb': '2月',
    'Mar': '3月',
    'Apr': '4月',
    'May': '5月',
    'Jun': '6月',
    'Jul': '7月',
    'Aug': '8月',
    'Sep': '9月',
    'Oct': '10月',
    'Nov': '11月',
    'Dec': '12月',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',

}


//需处理的前缀，此处可以截取语句开头部分的内容进行汉化
//例如：Coin: 13、Coin: 14、Coin: 15... 这种有相同开头的语句
//可以在这里汉化开头："Coin: ":"金币: "
var cnPrefix = {
    "\n": "\n",
    "                   ": "",
    "                  ": "",
    "                 ": "",
    "                ": "",
    "               ": "",
    "              ": "",
    "             ": "",
    "            ": "",
    "           ": "",
    "          ": "",
    "         ": "",
    "        ": "",
    "       ": "",
    "      ": "",
    "     ": "",
    "    ": "",
    "   ": "",
    "  ": " ",
    " ": " ",
    //树游戏
    "\t\t\t": "\t\t\t",
    "\n\n\t\t": "\n\n\t\t",
    "\n\t\t": "\n\t\t",
    "\t": "\t",
    "Show Milestones: ": "显示里程碑：",
    "Autosave: ": "自动保存: ",
    "Offline Prod: ": "离线生产: ",
    "Completed Challenges: ": "完成的挑战: ",
    "High-Quality Tree: ": "高质量树贴图: ",
    "Offline Time: ": "离线时间: ",
    "Theme: ": "主题: ",
    "Anti-Epilepsy Mode: ": "抗癫痫模式：",
    "In-line Exponent: ": "直列指数：",
    "Single-Tab Mode: ": "单标签模式：",
    "Time Played: ": "已玩时长：",
    "Shift-Click to Toggle Tooltips: ": "Shift-单击以切换工具提示：",
    "Notation: ": "符号: ",
    "Toggle Music: ": "切换声音: ",
    "Items: ": "物品: ",
    "Last saved: ": "最近保存: ",
    "Pack Storage: ": "卡包存储: ",
    "Ancient Pack ": "远古包 ",
    "Cyber Pack ": "赛博包 ",
    "Fakemon Pack ": "幻兽包 ",
    "Morty Pack ": "莫蒂包 ",
    "Mythical Pack ": "神话包 ",
    "Level: ": "等级: ",
    "Coin Production +": "金币生产 +",
    "Item Value +": "物品价值 +",
    "Amount: ": "数量: ",
    "Items per pack: ": "每个卡包物品数量: ",
    "Opening ": "打开",
    "Remaining Items: ": "剩余物品: ",
    "Total: ": "总计: ",
    "Sell All ": "全部出售 ",
    "Mr. Meeseeks Box": "米斯克斯先生的盒子",
    "Value: ": "价值: ",
    "(Max: ": "(最大: ",
    "Rick's Lab Coat": "瑞克的实验服",
    "Collected: ": "已收集: ",
    "": "",
    "": "",
    "": "",
    "": "",
}

//需处理的后缀，此处可以截取语句结尾部分的内容进行汉化
//例如：13 Coin、14 Coin、15 Coin... 这种有相同结尾的语句
//可以在这里汉化结尾：" Coin":" 金币"
var cnPostfix = {
    "                   ": "",
    "                  ": "",
    "                 ": "",
    "                ": "",
    "               ": "",
    "              ": "",
    "             ": "",
    "            ": "",
    "           ": "",
    "          ": "",
    "         ": "",
    "        ": "",
    "       ": "",
    "      ": "",
    "     ": "",
    "    ": "",
    "   ": "",
    "  ": "  ",
    " ": " ",
    "\n": "\n",
    "\n\t\t\t": "\n\t\t\t",
    "\t\t\n\t\t": "\t\t\n\t\t",
    "\t\t\t\t": "\t\t\t\t",
    "\n\t\t": "\n\t\t",
    "\t": "\t",
    "/sec)": "/秒)",
    ' I': ' I',
    ' II': ' II',
    ' III': ' III',
    ' IV': ' IV',
    ' V': ' V',
    ' VI': ' VI',
    ' VII': ' VII',
    ' VIII': ' VIII',
    ' X': ' X',
    ' XI': ' XI',
    ' XII': ' XII',
    ' XIII': ' XIII',
    ' XIV': ' XIV',
    ' XV': ' XV',
    ' XVI': ' XVI',
    " Contents": "内容",
    "/min": "/分钟",
    " XP": " 经验值",
    "": "",
    "": "",
}

//需排除的，正则匹配
var cnExcludeWhole = [
    /^(\d+)$/,
    /^\s*$/, //纯空格
    /^([\d\.]+):([\d\.]+)$/,
    /^([\d\.]+):([\d\.]+):([\d\.]+)$/,
    /^([\d\.]+):([\d\.]+):([\d\.]+):([\d\.]+)$/,
    /^([\d\.]+):([\d\.]+):([\d\.]+):([\d\.]+):([\d\.]+)$/,
    /^([\d\.]+)s$/,
    /^([\d\.]+)h$/,
    /^([\d\.]+)m$/,
    /^([\d\.]+)m ([\d\.]+)s$/,
    /^([\d\.]+)h ([\d\.]+)m ([\d\.]+)s$/,
    /^([\d\.]+)d ([\d\.]+)h ([\d\.]+)m ([\d\.]+)s$/,
    /^([\d\.]+)y ([\d\.]+)d ([\d\.]+)h ([\d\.]+)m ([\d\.]+)s$/,
    /^([\d\.]+)y ([\d\.]+)d ([\d\.]+)h$/,
    /^([\d\.]+)\-([\d\.]+)\-([\d\.]+)$/,
    /^([\d\.]+)e(\d+)$/,
    /^([\d\.]+)$/,
    /^\$([\d\.]+)$/,
    /^\(([\d\.]+)\)$/,
    /^\(\-([\d\.]+)\)$/,
    /^\(([\d\.]+)K\)$/,
    /^\(\+([\d\.]+)K\)$/,
    /^\(([\d\.]+)M\)$/,
    /^\(\+([\d\.]+)M\)$/,
    /^\(([\d\.]+)B\)$/,
    /^\(\+([\d\.]+)B\)$/,
    /^\(\+([\d\.]+)\%\)$/,
    /^\(\+([\d\.]+)\)$/,
    /^([\d\.]+)\%$/,
    /^\+([\d\.]+)\%$/,
    /^([\d\.]+)\/([\d\.]+)$/,
    /^([\d\.]+)\/([\d\.]+)K$/,
    /^([\d\.]+)K\/([\d\.]+)K$/,
    /^([\d\.]+)K\/([\d\.]+)M$/,
    /^([\d\.]+)M\/([\d\.]+)M$/,
    /^([\d\.]+)\/([\d\.,]+)$/,
    /^([\d\.,]+)\/([\d\.,]+)$/,
    /^\(([\d\.]+)\/([\d\.]+)\)$/,
    /^数量(.+)$/,
    /^价值(.+)$/,
    /^成本(.+)$/,
    /^(.+)分钟$/,
    /^\(([\d\.]+)\%\)$/,
    /^([\d\.]+):([\d\.]+):([\d\.]+)$/,
    /^([\d\.]+)K$/,
    /^\+([\d\.]+)K$/,
    /^\+([\d\.]+)M$/,
    /^\+([\d\.]+)B$/,
    /^([\d\.]+)M$/,
    /^([\d\.]+)B$/,
    /^([\d\.]+) K$/,
    /^([\d\.]+) M$/,
    /^([\d\.]+) B$/,
    /^([\d\.]+) T$/,
    /^([\d\.]+) Qi$/,
    /^([\d\.]+) Qa$/,
    /^([\d\.]+)s$/,
    /^([\d\.]+)x$/,
    /^x([\d\.]+)$/,
    /^([\d\.,]+)$/,
    /^\$([\d\.,]+)$/,
    /^\+([\d\.,]+)$/,
    /^\-([\d\.,]+)$/,
    /^([\d\.,]+)x$/,
    /^([\d\.,]+)\)$/,
    /^x([\d\.,]+)$/,
    /^×([\d\.,]+)$/,
    /^([\d\.,]+) \/ ([\d\.,]+)$/,
    /^([\d\.]+)e([\d\.,]+)$/,
    /^([\d\.]+)e([\d\.,]+) \/ ([\d\.]+)e([\d\.,]+)$/,
    /^\$([\d\.]+)e([\d\.,]+)$/,
    /^([\d\.,]+)\/([\d\.]+)e([\d\.,]+)$/,
    /^([\d\.]+)e([\d\.,]+)\/([\d\.]+)e([\d\.,]+)$/,
    /^([\d\.]+)e\+([\d\.,]+)$/,
    /^e([\d\.]+)e([\d\.,]+)$/,
    /^x([\d\.]+)e([\d\.,]+)$/,
    /^([\d\.]+)e([\d\.,]+)x$/,
    // /^([\uD800-\uDBFF][\uDC00-\uDFFF])|([\u2600-\u27BF])|([\u2300-\u23FF])|([\u2B50-\u2B55])|([\u203C-\u3299])|[\u21A9\u21AA\u25B6\u25C0\u2B06\u2B07\u2B05\u2B95\u2B99\u2B9A]+$/,
    // /^([\uD800-\uDBFF][\uDC00-\uDFFF])|([\u2600-\u27BF])|([\u2300-\u23FF])|([\u2B50-\u2B55])|([\u203C-\u3299])+$/,
    // /^[\uD800-\uFFFF]+$/,
    /^[\u4E00-\u9FA5]+$/
];
var cnExcludePostfix = [
]

//正则替换，带数字的固定格式句子
//纯数字：(\d+)
//字母加数字：([\d\.]+[A-Za-z])
//逗号：([\d\.,]+)
//小数点：([\d\.]+)
//原样输出的字段：(.+)
//换行加空格：\n(.+)
//&nbsp;空格：\xA0
var cnRegReplace = new Map([
    [/^([\d\.]+) hours ([\d\.]+) minutes ([\d\.]+) seconds$/, '$1 小时 $2 分钟 $3 秒'],
    [/^You are gaining (.+) elves per second$/, '你每秒获得 $1 精灵'],
    [/^Limit: (.+) per (.+)d (.+)h (.+)m$/, '上限: $1 每 $2天 $3小时 $4分钟'],
    [/^Limit: (.+) per (.+)h (.+)m (.+)s$/, '上限: $1 每 $2小时 $3分钟 $4秒'],
    [/^Limit: (.+) per (.+)m (.+)s$/, '上限: $1 每 $2分钟 $3秒'],
    [/^You have (.+) points$/, '你有 $1 点数'],
    [/^Next at (.+) points$/, '下一个在 $1 点数'],
    [/^Jan ([\d\.,]+) ([\d\.,]+), ([\d\.,]+):([\d\.,]+)$/, '$2 年 1 月 $1, $3:$4'],
    [/^Feb ([\d\.,]+) ([\d\.,]+), ([\d\.,]+):([\d\.,]+)$/, '$2 年 2 月 $1, $3:$4'],
    [/^Mar ([\d\.,]+) ([\d\.,]+), ([\d\.,]+):([\d\.,]+)$/, '$2 年 3 月 $1, $3:$4'],
    [/^Apr ([\d\.,]+) ([\d\.,]+), ([\d\.,]+):([\d\.,]+)$/, '$2 年 4 月 $1, $3:$4'],
    [/^May ([\d\.,]+) ([\d\.,]+), ([\d\.,]+):([\d\.,]+)$/, '$2 年 5 月 $1, $3:$4'],
    [/^Jun ([\d\.,]+) ([\d\.,]+), ([\d\.,]+):([\d\.,]+)$/, '$2 年 6 月 $1, $3:$4'],
    [/^Jul ([\d\.,]+) ([\d\.,]+), ([\d\.,]+):([\d\.,]+)$/, '$2 年 7 月 $1, $3:$4'],
    [/^Aug ([\d\.,]+) ([\d\.,]+), ([\d\.,]+):([\d\.,]+)$/, '$2 年 8 月 $1, $3:$4'],
    [/^Sep ([\d\.,]+) ([\d\.,]+), ([\d\.,]+):([\d\.,]+)$/, '$2 年 9 月 $1, $3:$4'],
    [/^Oct ([\d\.,]+) ([\d\.,]+), ([\d\.,]+):([\d\.,]+)$/, '$2 年 10 月 $1, $3:$4'],
    [/^Nov ([\d\.,]+) ([\d\.,]+), ([\d\.,]+):([\d\.,]+)$/, '$2 年 11 月 $1, $3:$4'],
    [/^Dec ([\d\.,]+) ([\d\.,]+), ([\d\.,]+):([\d\.,]+)$/, '$2 年 12 月 $1, $3:$4'],
    [/^([\d\.]+)\/sec$/, '$1\/秒'],
    [/^([\d\.,]+)\/sec$/, '$1\/秒'],
    [/^([\d\.,]+) OOMs\/sec$/, '$1 OOMs\/秒'],
    [/^([\d\.]+) OOMs\/sec$/, '$1 OOMs\/秒'],
    [/^([\d\.]+)e([\d\.,]+)\/sec$/, '$1e$2\/秒'],
    [/^requires ([\d\.]+) more research points$/, '需要$1个研究点'],
    [/^([\d\.]+)e([\d\.,]+) points$/, '$1e$2 点数'],
    [/^([\d\.]+) elves$/, '$1 精灵'],
    [/^\+([\d\.]+)\% Item Value$/, '\+$1\% 物品价值'],
    [/^\+([\d\.]+)\% Coin Production$/, '\+$1\% 金币生产'],
    [/^([\d\.]+)d ([\d\.]+)h ([\d\.]+)m$/, '$1天 $2小时 $3分'],
    [/^([\d\.]+)e([\d\.,]+) elves$/, '$1e$2 精灵'],
    [/^([\d\.,]+) elves$/, '$1 精灵'],
    [/^Resets in ([\d\.,]+)d ([\d\.,]+)h ([\d\.,]+)m$/, '重置剩余时间 $1天 $2小时 $3分钟'],
    [/^Resets in ([\d\.,]+)h ([\d\.,]+)m ([\d\.,]+)s$/, '重置剩余时间 $1小时 $2分钟 $3秒'],
    [/^Resets in ([\d\.,]+)m ([\d\.,]+)s$/, '重置剩余时间 $1分钟 $2秒'],
    [/^Resets in ([\d\.,]+)s$/, '重置剩余时间 $1秒'],
    [/^Open ([\d\.,]+) packs$/, '打开 $1 日常包'],
    [/^Open ([\d\.,]+) daily packs$/, '打开 $1 日常包'],
    [/^Earn ([\d\.,]+) coins total$/, '总计赚取 $1 金币'],
    [/^Collect ([\d\.,]+) different items$/, '收集 $1 不同的物品'],
    [/^Attack: ([\d\.,]+) \| Defense: ([\d\.,]+)$/, '攻击: $1 \| 防御: $2'],
    [/^Rewards: ([\d\.,]+) coins, ([\d\.,]+) xp$/, '奖励: $1 金币, $2 经验值'],
    [/^Open ([\d\.,]+)$/, '打开 $1'],
    [/^Level ([\d\.,]+)$/, '等级 $1'],
    [/^Sell ([\d\.,]+)$/, '出售 $1'],
    [/^Boss ([\d\.,]+)$/, '首领 $1'],
    [/^Buy ([\d\.,]+)$/, '购买 $1'],
    [/^Day ([\d\.,]+)$/, '天数 $1'],
    [/^level ([\d\.,]+) \/ ([\d\.,]+)$/, '等级 $1 \/ $2'],
    [/^level: ([\d\.,]+) \/ ([\d\.,]+)$/, '等级 $1 \/ $2'],
    [/^\*(.+) to electricity gain$/, '\*$1 到电力增益'],
    [/^(.+) coins each$/, '$1 金币每个'],
    [/^Price: (.+) coins$/, '价格：$1 金币'],
    [/^Price: (.+)$/, '价格：$1'],
    [/^Coins: (.+)$/, '金币: $1'],
    [/^(.+) coins$/, '$1 金币'],
    [/^Cost: (.+) points$/, '成本：$1 点数'],
    [/^Req: (.+) elves$/, '要求：$1 精灵'],
    [/^Req: (.+) \/ (.+) elves$/, '要求：$1 \/ $2 精灵'],
    [/^Usages: (\d+)\/$/, '用途：$1\/'],
    [/^workers: (\d+)\/$/, '工人：$1\/'],

]);