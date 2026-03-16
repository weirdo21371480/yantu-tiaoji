import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo TEXT,
      location TEXT NOT NULL,
      type TEXT,
      category TEXT,
      description TEXT,
      website TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (school_id) REFERENCES schools(id)
    );
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL,
      school_name TEXT NOT NULL,
      department TEXT NOT NULL,
      subject TEXT NOT NULL,
      degree TEXT NOT NULL,
      location TEXT NOT NULL,
      vacancies INTEGER DEFAULT 0,
      score_requirement INTEGER DEFAULT 0,
      english_requirement INTEGER DEFAULT 0,
      math_requirement INTEGER DEFAULT 0,
      professional_requirement INTEGER DEFAULT 0,
      contact TEXT,
      phone TEXT,
      email TEXT,
      description TEXT,
      requirements TEXT,
      publish_date DATE,
      deadline DATE,
      status TEXT DEFAULT 'active',
      is_hot INTEGER DEFAULT 0,
      year INTEGER DEFAULT 2026,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      listing_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (listing_id) REFERENCES listings(id),
      UNIQUE(user_id, listing_id)
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM schools').get();
  if (count.c === 0) seed();
}

/* ── 全部 39 所 985 高校 ── */
const schoolsData = [
  { name:'北京大学', location:'北京', type:'985/211', category:'综合类', desc:'北京大学创办于1898年，初名京师大学堂，是中国第一所国立综合性大学，也是当时中国最高教育行政机关。', web:'https://www.pku.edu.cn', depts:['数学科学学院','物理学院','化学与分子工程学院','生命科学学院','信息科学技术学院','工学院','环境科学与工程学院'] },
  { name:'清华大学', location:'北京', type:'985/211', category:'理工类', desc:'清华大学是中国著名高等学府，坐落于北京西北郊风景秀丽的清华园，是中国高层次人才培养和科学技术研究的重要基地。', web:'https://www.tsinghua.edu.cn', depts:['计算机科学与技术系','电子工程系','自动化系','建筑学院','材料学院','化学工程系'] },
  { name:'中国人民大学', location:'北京', type:'985/211', category:'综合类', desc:'中国人民大学是一所以人文社会科学为主的综合性研究型全国重点大学，直属于教育部。', web:'https://www.ruc.edu.cn', depts:['经济学院','法学院','商学院','统计学院','信息学院','公共管理学院'] },
  { name:'北京理工大学', location:'北京', type:'985/211', category:'理工类', desc:'北京理工大学是中国共产党创办的第一所理工科大学，隶属于工业和信息化部，首批进入国家"211工程"和"985工程"。', web:'https://www.bit.edu.cn', depts:['计算机学院','自动化学院','机械与车辆学院','信息与电子学院','材料学院','化学与化工学院'] },
  { name:'北京航空航天大学', location:'北京', type:'985/211', category:'理工类', desc:'北京航空航天大学创建于1952年，是新中国第一所航空航天高等学府，现隶属于工业和信息化部。', web:'https://www.buaa.edu.cn', depts:['计算机学院','电子信息工程学院','自动化科学与电气工程学院','材料科学与工程学院','航空科学与工程学院'] },
  { name:'北京师范大学', location:'北京', type:'985/211', category:'师范类', desc:'北京师范大学是教育部直属重点大学，是一所以教师教育、教育科学和文理基础学科为主要特色的著名学府。', web:'https://www.bnu.edu.cn', depts:['教育学部','心理学部','文学院','数学科学学院','物理学系','化学学院','环境学院'] },
  { name:'中国农业大学', location:'北京', type:'985/211', category:'农林类', desc:'中国农业大学是国家"双一流"建设高校，是我国现代农业高等教育的起源地。2025年工学院接收调剂。', web:'https://www.cau.edu.cn', depts:['农学院','工学院','信息与电气工程学院','食品科学与营养工程学院','生物学院','资源与环境学院','水利与土木工程学院'] },
  { name:'中央民族大学', location:'北京', type:'985/211', category:'民族类', desc:'中央民族大学是党和国家为解决中国民族问题、培养少数民族干部和高级专门人才而创建的一所具有鲜明特色的高等学校。', web:'https://www.muc.edu.cn', depts:['民族学与社会学学院','经济学院','法学院','文学院','理学院','信息工程学院'] },
  { name:'南开大学', location:'天津', type:'985/211', category:'综合类', desc:'南开大学由严修、张伯苓秉承教育救国理念创办，是国家教育部直属重点综合性大学。', web:'https://www.nankai.edu.cn', depts:['数学科学学院','物理科学学院','化学学院','生命科学学院','经济学院','商学院','计算机学院'] },
  { name:'天津大学', location:'天津', type:'985/211', category:'理工类', desc:'天津大学是教育部直属国家重点大学，其前身为北洋大学，始建于1895年10月2日，是中国第一所现代大学。2025年接收部分专业调剂。', web:'https://www.tju.edu.cn', depts:['精密仪器与光电子工程学院','机械工程学院','建筑学院','化工学院','材料科学与工程学院','电气自动化与信息工程学院'] },
  { name:'大连理工大学', location:'辽宁', type:'985/211', category:'理工类', desc:'大连理工大学是教育部直属全国重点大学，是国家"211工程"和"985工程"重点建设高校。2025年部分学院接收调剂。', web:'https://www.dlut.edu.cn', depts:['化工学院','机械工程学院','材料科学与工程学院','土木工程学院','环境学院','数学科学学院','物理学院'] },
  { name:'东北大学', location:'辽宁', type:'985/211', category:'理工类', desc:'东北大学始建于1923年，是一所以工为主的多科性大学，是教育部直属的国家重点大学。2025年多个学院接收调剂。', web:'https://www.neu.edu.cn', depts:['计算机科学与工程学院','信息科学与工程学院','机械工程与自动化学院','材料科学与工程学院','冶金学院','资源与土木工程学院'] },
  { name:'吉林大学', location:'吉林', type:'985/211', category:'综合类', desc:'吉林大学是教育部直属的全国重点综合性大学，坐落在吉林省长春市，学科门类齐全。2025年多个学院接收调剂。', web:'https://www.jlu.edu.cn', depts:['化学学院','物理学院','数学学院','生命科学学院','机械与航空航天工程学院','汽车工程学院','材料科学与工程学院','地球科学学院'] },
  { name:'哈尔滨工业大学', location:'黑龙江', type:'985/211', category:'理工类', desc:'哈尔滨工业大学始建于1920年，是工业和信息化部直属的全国重点大学，"C9联盟"高校之一。威海校区2025年接收部分调剂。', web:'https://www.hit.edu.cn', depts:['计算机科学与技术学院','电子与信息工程学院','机电工程学院','材料科学与工程学院','航天学院','土木工程学院'] },
  { name:'复旦大学', location:'上海', type:'985/211', category:'综合类', desc:'复旦大学始创于1905年，是中国人自主创办的第一所高等院校，是国家"双一流"建设高校。', web:'https://www.fudan.edu.cn', depts:['数学科学学院','物理学系','化学系','生命科学学院','计算机科学技术学院','信息科学与工程学院'] },
  { name:'上海交通大学', location:'上海', type:'985/211', category:'理工类', desc:'上海交通大学是我国历史最悠久、享誉海内外的著名高等学府之一，是教育部直属并与上海市共建的全国重点大学。', web:'https://www.sjtu.edu.cn', depts:['电子信息与电气工程学院','机械与动力工程学院','船舶海洋与建筑工程学院','材料科学与工程学院','化学化工学院'] },
  { name:'同济大学', location:'上海', type:'985/211', category:'理工类', desc:'同济大学历史悠久、声誉卓著，是中国最早的国立大学之一，是教育部直属并与上海市共建的全国重点大学。', web:'https://www.tongji.edu.cn', depts:['建筑与城市规划学院','土木工程学院','机械与能源工程学院','电子与信息工程学院','环境科学与工程学院','材料科学与工程学院'] },
  { name:'华东师范大学', location:'上海', type:'985/211', category:'师范类', desc:'华东师范大学是由国家举办、教育部主管，教育部与上海市人民政府重点共建的综合性研究型大学。', web:'https://www.ecnu.edu.cn', depts:['教育学部','心理与认知科学学院','数学科学学院','物理与电子科学学院','化学与分子工程学院','生命科学学院','计算机科学与技术学院'] },
  { name:'南京大学', location:'江苏', type:'985/211', category:'综合类', desc:'南京大学坐落于钟灵毓秀、虎踞龙蟠的金陵古都，是一所历史悠久、声誉卓著的百年名校。', web:'https://www.nju.edu.cn', depts:['物理学院','化学化工学院','计算机科学与技术系','电子科学与工程学院','地球科学与工程学院','环境学院'] },
  { name:'东南大学', location:'江苏', type:'985/211', category:'理工类', desc:'东南大学是中央直管、教育部直属的全国重点大学，是"985工程"和"211工程"重点建设大学之一。2025年部分学院接收调剂。', web:'https://www.seu.edu.cn', depts:['建筑学院','土木工程学院','信息科学与工程学院','电子科学与工程学院','计算机科学与工程学院','生物科学与医学工程学院'] },
  { name:'浙江大学', location:'浙江', type:'985/211', category:'综合类', desc:'浙江大学是一所历史悠久、声誉卓著的高等学府，坐落于中国历史文化名城、风景旅游胜地杭州。', web:'https://www.zju.edu.cn', depts:['计算机科学与技术学院','控制科学与工程学院','光电科学与工程学院','生物医学工程与仪器科学学院','化学工程与生物工程学院','材料科学与工程学院'] },
  { name:'中国科学技术大学', location:'安徽', type:'985/211', category:'理工类', desc:'中国科学技术大学是中国科学院所属的一所以前沿科学和高新技术为主的大学。', web:'https://www.ustc.edu.cn', depts:['数学科学学院','物理学院','化学与材料科学学院','生命科学与医学部','工程科学学院','计算机科学与技术学院'] },
  { name:'厦门大学', location:'福建', type:'985/211', category:'综合类', desc:'厦门大学由著名爱国华侨领袖陈嘉庚先生于1921年创办，是中国近代教育史上第一所华侨创办的大学。', web:'https://www.xmu.edu.cn', depts:['化学化工学院','物理科学与技术学院','数学科学学院','生命科学学院','海洋与地球学院','材料学院','能源学院'] },
  { name:'山东大学', location:'山东', type:'985/211', category:'综合类', desc:'山东大学是一所历史悠久、学科齐全的教育部直属重点综合性大学，是"985工程"和"211工程"重点建设高校。2025年多个学院接收调剂。', web:'https://www.sdu.edu.cn', depts:['数学学院','物理学院','化学与化工学院','生命科学学院','材料科学与工程学院','机械工程学院','控制科学与工程学院','环境科学与工程学院'] },
  { name:'中国海洋大学', location:'山东', type:'985/211', category:'综合类', desc:'中国海洋大学是一所海洋和水产学科特色显著、学科门类齐全的教育部直属重点综合性大学。2025年多个学院接收调剂。', web:'https://www.ouc.edu.cn', depts:['海洋与大气学院','信息科学与工程学部','化学化工学院','食品科学与工程学院','材料科学与工程学院','环境科学与工程学院','水产学院'] },
  { name:'武汉大学', location:'湖北', type:'985/211', category:'综合类', desc:'武汉大学溯源于1893年清末湖广总督张之洞创办的自强学堂，历经传承演变，是教育部直属全国重点大学。2025年部分学院接收调剂。', web:'https://www.whu.edu.cn', depts:['测绘学院','遥感信息工程学院','水利水电学院','电气与自动化学院','资源与环境科学学院','生命科学学院','化学与分子科学学院'] },
  { name:'华中科技大学', location:'湖北', type:'985/211', category:'理工类', desc:'华中科技大学是国家教育部直属重点综合性大学，被誉为"新中国高等教育发展的缩影"。', web:'https://www.hust.edu.cn', depts:['机械科学与工程学院','光学与电子信息学院','电气与电子工程学院','计算机科学与技术学院','材料科学与工程学院','化学与化工学院','生命科学与技术学院'] },
  { name:'湖南大学', location:'湖南', type:'985/211', category:'综合类', desc:'湖南大学坐落于中国历史文化名城长沙，前临碧波荡漾的湘江，后倚秀如琢玉的岳麓山。2025年部分学院接收调剂。', web:'https://www.hnu.edu.cn', depts:['机械与运载工程学院','电气与信息工程学院','化学化工学院','土木工程学院','环境科学与工程学院','材料科学与工程学院','生物学院'] },
  { name:'中南大学', location:'湖南', type:'985/211', category:'理工类', desc:'中南大学坐落在中国历史文化名城长沙，是教育部直属全国重点大学，以工学和医学见长。', web:'https://www.csu.edu.cn', depts:['材料科学与工程学院','冶金与环境学院','化学化工学院','机电工程学院','地球科学与信息物理学院','土木工程学院','资源与安全工程学院'] },
  { name:'中山大学', location:'广东', type:'985/211', category:'综合类', desc:'中山大学由孙中山先生创办，有着一百多年办学传统，是中国南方科学研究、文化学术与人才培养的重镇。', web:'https://www.sysu.edu.cn', depts:['物理学院','化学学院','生命科学学院','材料科学与工程学院','电子与信息工程学院','计算机学院','地球科学与工程学院'] },
  { name:'华南理工大学', location:'广东', type:'985/211', category:'理工类', desc:'华南理工大学地处广州，是直属教育部的全国重点大学，以工见长，理工医结合。2025年部分学院接收调剂。', web:'https://www.scut.edu.cn', depts:['机械与汽车工程学院','建筑学院','化学与化工学院','材料科学与工程学院','电子与信息学院','自动化科学与工程学院','土木与交通学院'] },
  { name:'四川大学', location:'四川', type:'985/211', category:'综合类', desc:'四川大学是教育部直属全国重点大学，是国家布局在中国西部的重点建设的高水平研究型综合大学。2025年多个学院接收调剂。', web:'https://www.scu.edu.cn', depts:['化学学院','物理学院','生命科学学院','化学工程学院','材料科学与工程学院','水利水电学院','制造科学与工程学院','高分子科学与工程学院'] },
  { name:'电子科技大学', location:'四川', type:'985/211', category:'理工类', desc:'电子科技大学坐落于四川省成都市，是一所完整覆盖整个电子信息类学科，以电子信息科学技术为核心的大学。2025年部分学院接收调剂。', web:'https://www.uestc.edu.cn', depts:['通信抗干扰技术国家级重点实验室','电子科学与工程学院','信息与通信工程学院','材料与能源学院','机械与电气工程学院','光电科学与工程学院'] },
  { name:'重庆大学', location:'重庆', type:'985/211', category:'综合类', desc:'重庆大学创办于1929年，是教育部直属的全国重点大学、"211工程"和"985工程"重点建设高校。2025年多个学院接收调剂。', web:'https://www.cqu.edu.cn', depts:['机械与运载工程学院','电气工程学院','土木工程学院','材料科学与工程学院','化学化工学院','环境与生态学院','光电工程学院'] },
  { name:'西安交通大学', location:'陕西', type:'985/211', category:'理工类', desc:'西安交通大学是我国最早兴办的高等学府之一，是教育部直属重点大学。2025年部分学院接收调剂。', web:'https://www.xjtu.edu.cn', depts:['机械工程学院','电子与信息学部','能源与动力工程学院','材料科学与工程学院','化学工程与技术学院','生命科学与技术学院'] },
  { name:'西北工业大学', location:'陕西', type:'985/211', category:'理工类', desc:'西北工业大学坐落于陕西西安，是以发展航空、航天、航海等领域人才培养和科学研究为特色的多科性研究型大学。', web:'https://www.nwpu.edu.cn', depts:['航空学院','航天学院','材料学院','机电学院','自动化学院','计算机学院','电子信息学院'] },
  { name:'西北农林科技大学', location:'陕西', type:'985/211', category:'农林类', desc:'西北农林科技大学坐落于陕西杨凌，是教育部直属全国重点大学，以农林水为特色。2025年大量学院接收调剂。', web:'https://www.nwafu.edu.cn', depts:['农学院','植物保护学院','园艺学院','动物科技学院','食品科学与工程学院','林学院','资源环境学院','水利与建筑工程学院','机械与电子工程学院','信息工程学院','生命科学学院','化学与药学院'] },
  { name:'兰州大学', location:'甘肃', type:'985/211', category:'综合类', desc:'兰州大学是教育部直属全国重点综合性大学，位于甘肃省省会兰州市。由于地理位置原因，每年有大量专业接收调剂。', web:'https://www.lzu.edu.cn', depts:['化学化工学院','物理科学与技术学院','生命科学学院','数学与统计学院','信息科学与工程学院','草地农业科技学院','大气科学学院','地质科学与矿产资源学院','土木工程与力学学院','核科学与技术学院','生态学院'] },
  { name:'国防科技大学', location:'湖南', type:'985/211', category:'军事类', desc:'国防科技大学是直属中央军委领导的军队综合性大学，是国家"双一流"建设高校。招生面向军队系统。', web:'https://www.nudt.edu.cn', depts:['计算机学院','电子科学学院','前沿交叉学科学院','智能科学学院','系统工程学院'] },
];

/* ── 近三年调剂数据（基于研招网、文都考研等来源整理） ── */
const listingsData = [
  // ========== 2024 年 ==========
  { school:'兰州大学', dept:'化学化工学院', subject:'化学', degree:'学术型硕士', vac:15, score:279, eng:40, math:60, prof:60, contact:'招生办', phone:'0931-8912168', email:'yzb@lzu.edu.cn', desc:'兰州大学化学化工学院2024年接收化学各二级学科调剂，包括无机化学、有机化学、分析化学、物理化学等方向。学院拥有功能有机分子化学国家重点实验室。', reqs:['初试成绩达到2024年国家A类线','本科为化学及相关专业','优先接收第一志愿报考985/211院校考生'], pub:'2024-03-20', dead:'2024-04-15', hot:1, year:2024 },
  { school:'兰州大学', dept:'生命科学学院', subject:'生物学', degree:'学术型硕士', vac:12, score:279, eng:40, math:0, prof:60, contact:'招生办', phone:'0931-8912168', email:'yzb@lzu.edu.cn', desc:'兰州大学生命科学学院2024年接收生物学相关方向调剂，包括植物学、细胞生物学、生态学等。', reqs:['初试成绩达到2024年A类国家线','本科为生物相关专业','有科研经历者优先'], pub:'2024-03-22', dead:'2024-04-18', hot:0, year:2024 },
  { school:'兰州大学', dept:'大气科学学院', subject:'大气科学', degree:'学术型硕士', vac:8, score:279, eng:40, math:60, prof:60, contact:'招生办', phone:'0931-8912168', email:'yzb@lzu.edu.cn', desc:'兰州大学大气科学学院2024年接收大气科学方向调剂。学院大气科学学科为国家一流建设学科。', reqs:['初试成绩达到国家A类线','本科为大气科学、物理学、数学等相关专业'], pub:'2024-03-21', dead:'2024-04-12', hot:0, year:2024 },
  { school:'兰州大学', dept:'草地农业科技学院', subject:'草学', degree:'学术型硕士', vac:20, score:251, eng:33, math:0, prof:50, contact:'招生办', phone:'0931-8912168', email:'yzb@lzu.edu.cn', desc:'兰州大学草地农业科技学院2024年接收草学方向大量调剂。草学为国家一流建设学科，全国排名第一。', reqs:['初试成绩达到农学国家A类线','本科为农学、生物、生态等相关专业'], pub:'2024-03-18', dead:'2024-04-20', hot:1, year:2024 },
  { school:'西北农林科技大学', dept:'农学院', subject:'作物学', degree:'学术型硕士', vac:25, score:251, eng:33, math:0, prof:50, contact:'研招办', phone:'029-87082851', email:'yzb@nwsuaf.edu.cn', desc:'西北农林科技大学农学院2024年作物学各方向接收调剂。学院拥有旱区作物逆境生物学国家重点实验室。', reqs:['初试成绩达到农学国家A类线','本科为农学相关专业','接受跨专业调剂'], pub:'2024-03-19', dead:'2024-04-20', hot:1, year:2024 },
  { school:'西北农林科技大学', dept:'食品科学与工程学院', subject:'食品科学与工程', degree:'专业型硕士', vac:18, score:273, eng:37, math:56, prof:56, contact:'研招办', phone:'029-87082851', email:'yzb@nwsuaf.edu.cn', desc:'西北农林科技大学食品科学与工程学院2024年接收食品加工与安全等方向调剂。', reqs:['初试成绩达到工学国家A类线','本科为食品科学、化学、生物等相关专业'], pub:'2024-03-20', dead:'2024-04-18', hot:0, year:2024 },
  { school:'西北农林科技大学', dept:'水利与建筑工程学院', subject:'水利工程', degree:'学术型硕士', vac:15, score:273, eng:37, math:56, prof:56, contact:'研招办', phone:'029-87082851', email:'yzb@nwsuaf.edu.cn', desc:'西北农林科技大学水利与建筑工程学院2024年水利工程方向接收调剂。', reqs:['初试成绩达到工学国家A类线','本科为水利工程、土木工程等相关专业'], pub:'2024-03-21', dead:'2024-04-15', hot:0, year:2024 },
  { school:'中国农业大学', dept:'工学院', subject:'机械工程', degree:'专业型硕士', vac:10, score:273, eng:37, math:56, prof:56, contact:'工学院研究生办', phone:'010-62736741', email:'gxy@cau.edu.cn', desc:'中国农业大学工学院2024年机械工程专业接收调剂。研究方向包括农业机械化、智能农机装备等。', reqs:['初试成绩达到工学国家A类线','本科为机械、自动化等相关专业','有机器人或智能装备研究经历者优先'], pub:'2024-03-22', dead:'2024-04-12', hot:0, year:2024 },
  { school:'中国农业大学', dept:'资源与环境学院', subject:'环境科学与工程', degree:'学术型硕士', vac:8, score:279, eng:40, math:60, prof:60, contact:'研招办', phone:'010-62737904', email:'yzb@cau.edu.cn', desc:'中国农业大学资源与环境学院2024年接收环境科学与工程方向调剂。', reqs:['初试成绩达到理学国家A类线','本科为环境、化学、生物等相关专业'], pub:'2024-03-23', dead:'2024-04-15', hot:0, year:2024 },
  { school:'中国海洋大学', dept:'化学化工学院', subject:'化学', degree:'学术型硕士', vac:10, score:279, eng:40, math:60, prof:60, contact:'研招办', phone:'0532-66782080', email:'yzb@ouc.edu.cn', desc:'中国海洋大学化学化工学院2024年接收化学各方向调剂，包括海洋化学方向。', reqs:['初试成绩达到理学国家A类线','本科为化学、应用化学等相关专业'], pub:'2024-03-20', dead:'2024-04-16', hot:0, year:2024 },
  { school:'中国海洋大学', dept:'材料科学与工程学院', subject:'材料科学与工程', degree:'学术型硕士', vac:8, score:273, eng:37, math:56, prof:56, contact:'研招办', phone:'0532-66782080', email:'yzb@ouc.edu.cn', desc:'中国海洋大学材料科学与工程学院2024年接收材料学方向调剂，含海洋防腐材料等特色方向。', reqs:['初试成绩达到工学国家A类线','本科为材料、化学、物理等相关专业'], pub:'2024-03-21', dead:'2024-04-16', hot:0, year:2024 },
  { school:'东北大学', dept:'材料科学与工程学院', subject:'材料科学与工程', degree:'学术型硕士', vac:12, score:273, eng:37, math:56, prof:56, contact:'研招办', phone:'024-83687556', email:'yzb@mail.neu.edu.cn', desc:'东北大学材料科学与工程学院2024年接收材料科学与工程方向调剂，研究方向涵盖金属材料、无机非金属材料等。', reqs:['初试成绩达到工学国家A类线','本科为材料、冶金、化学等相关专业'], pub:'2024-03-19', dead:'2024-04-14', hot:0, year:2024 },
  { school:'东北大学', dept:'冶金学院', subject:'冶金工程', degree:'学术型硕士', vac:15, score:273, eng:37, math:56, prof:56, contact:'研招办', phone:'024-83687556', email:'yzb@mail.neu.edu.cn', desc:'东北大学冶金学院2024年冶金工程方向接收调剂。冶金工程为国家一流建设学科。', reqs:['初试成绩达到工学国家A类线','本科为冶金、材料、化工等相关专业'], pub:'2024-03-18', dead:'2024-04-14', hot:0, year:2024 },
  { school:'吉林大学', dept:'化学学院', subject:'化学', degree:'学术型硕士', vac:10, score:279, eng:40, math:60, prof:60, contact:'研招办', phone:'0431-85166420', email:'yzb@jlu.edu.cn', desc:'吉林大学化学学院2024年接收化学各方向调剂。学院拥有无机合成与制备化学国家重点实验室。', reqs:['初试成绩达到理学国家A类线','本科为化学、应用化学等相关专业','有科研论文者优先'], pub:'2024-03-21', dead:'2024-04-16', hot:0, year:2024 },
  { school:'吉林大学', dept:'地球科学学院', subject:'地质学', degree:'学术型硕士', vac:12, score:279, eng:40, math:60, prof:60, contact:'研招办', phone:'0431-85166420', email:'yzb@jlu.edu.cn', desc:'吉林大学地球科学学院2024年接收地质学方向调剂。', reqs:['初试成绩达到理学国家A类线','本科为地质学、地球物理等相关专业'], pub:'2024-03-20', dead:'2024-04-18', hot:0, year:2024 },
  { school:'山东大学', dept:'材料科学与工程学院', subject:'材料科学与工程', degree:'学术型硕士', vac:10, score:273, eng:37, math:56, prof:56, contact:'研招办', phone:'0531-88364334', email:'yzb@sdu.edu.cn', desc:'山东大学材料科学与工程学院2024年接收材料学方向调剂。', reqs:['初试成绩达到工学国家A类线','本科为材料、物理、化学等相关专业'], pub:'2024-03-22', dead:'2024-04-15', hot:0, year:2024 },
  { school:'四川大学', dept:'化学工程学院', subject:'化学工程与技术', degree:'专业型硕士', vac:12, score:273, eng:37, math:56, prof:56, contact:'研招办', phone:'028-85407437', email:'yzb@scu.edu.cn', desc:'四川大学化学工程学院2024年接收化学工程与技术方向调剂。', reqs:['初试成绩达到工学国家A类线','本科为化工、化学等相关专业'], pub:'2024-03-20', dead:'2024-04-16', hot:0, year:2024 },
  { school:'四川大学', dept:'水利水电学院', subject:'水利工程', degree:'学术型硕士', vac:10, score:273, eng:37, math:56, prof:56, contact:'研招办', phone:'028-85407437', email:'yzb@scu.edu.cn', desc:'四川大学水利水电学院2024年水利工程方向接收调剂。', reqs:['初试成绩达到工学国家A类线','本科为水利、土木等相关专业'], pub:'2024-03-21', dead:'2024-04-14', hot:0, year:2024 },
  { school:'重庆大学', dept:'材料科学与工程学院', subject:'材料科学与工程', degree:'学术型硕士', vac:10, score:273, eng:37, math:56, prof:56, contact:'研招办', phone:'023-65102374', email:'yzb@cqu.edu.cn', desc:'重庆大学材料科学与工程学院2024年接收材料学方向调剂。', reqs:['初试成绩达到工学国家A类线','本科为材料、化学、物理等相关专业'], pub:'2024-03-22', dead:'2024-04-15', hot:0, year:2024 },
  { school:'重庆大学', dept:'化学化工学院', subject:'化学工程与技术', degree:'学术型硕士', vac:8, score:273, eng:37, math:56, prof:56, contact:'研招办', phone:'023-65102374', email:'yzb@cqu.edu.cn', desc:'重庆大学化学化工学院2024年化学工程方向接收调剂。', reqs:['初试成绩达到工学国家A类线','本科为化工、化学等相关专业'], pub:'2024-03-23', dead:'2024-04-16', hot:0, year:2024 },
  { school:'湖南大学', dept:'化学化工学院', subject:'化学', degree:'学术型硕士', vac:8, score:279, eng:40, math:60, prof:60, contact:'研招办', phone:'0731-88822856', email:'yzb@hnu.edu.cn', desc:'湖南大学化学化工学院2024年接收化学各方向调剂。', reqs:['初试成绩达到理学国家A类线','本科为化学相关专业'], pub:'2024-03-21', dead:'2024-04-15', hot:0, year:2024 },
  { school:'大连理工大学', dept:'化工学院', subject:'化学工程与技术', degree:'学术型硕士', vac:8, score:273, eng:37, math:56, prof:56, contact:'研招办', phone:'0411-84708338', email:'yzb@dlut.edu.cn', desc:'大连理工大学化工学院2024年化学工程方向接收调剂。化学工程与技术为一流建设学科。', reqs:['初试成绩达到工学国家A类线','本科为化工、化学等相关专业'], pub:'2024-03-22', dead:'2024-04-16', hot:0, year:2024 },

  // ========== 2025 年 ==========
  { school:'兰州大学', dept:'化学化工学院', subject:'化学', degree:'学术型硕士', vac:18, score:280, eng:40, math:60, prof:60, contact:'招生办', phone:'0931-8912168', email:'yzb@lzu.edu.cn', desc:'兰州大学化学化工学院2025年继续接收化学各二级学科调剂。学院设有功能有机分子化学国家重点实验室，科研实力雄厚。', reqs:['初试成绩达到2025年国家A类线','本科为化学、应用化学、材料化学等相关专业','优先接收第一志愿报考985/211院校考生'], pub:'2025-03-18', dead:'2025-04-12', hot:1, year:2025 },
  { school:'兰州大学', dept:'核科学与技术学院', subject:'核科学与技术', degree:'学术型硕士', vac:10, score:275, eng:38, math:57, prof:57, contact:'招生办', phone:'0931-8912168', email:'yzb@lzu.edu.cn', desc:'兰州大学核科学与技术学院2025年接收调剂，研究方向包括粒子物理与原子核物理、放射化学等。', reqs:['初试成绩达到工学国家A类线','本科为物理、核工程、化学等相关专业'], pub:'2025-03-20', dead:'2025-04-15', hot:0, year:2025 },
  { school:'兰州大学', dept:'草地农业科技学院', subject:'草学', degree:'学术型硕士', vac:22, score:253, eng:34, math:0, prof:51, contact:'招生办', phone:'0931-8912168', email:'yzb@lzu.edu.cn', desc:'兰州大学草地农业科技学院2025年继续大量接收草学方向调剂。草学学科全国排名第一。', reqs:['初试成绩达到农学国家A类线','本科为农学、生物、生态等相关专业'], pub:'2025-03-15', dead:'2025-04-20', hot:1, year:2025 },
  { school:'兰州大学', dept:'土木工程与力学学院', subject:'力学', degree:'学术型硕士', vac:10, score:280, eng:40, math:60, prof:60, contact:'招生办', phone:'0931-8912168', email:'yzb@lzu.edu.cn', desc:'兰州大学土木工程与力学学院2025年接收力学方向调剂。', reqs:['初试成绩达到理学国家A类线','本科为力学、土木、物理等相关专业'], pub:'2025-03-22', dead:'2025-04-18', hot:0, year:2025 },
  { school:'西北农林科技大学', dept:'农学院', subject:'作物学', degree:'学术型硕士', vac:28, score:253, eng:34, math:0, prof:51, contact:'研招办', phone:'029-87082851', email:'yzb@nwsuaf.edu.cn', desc:'西北农林科技大学农学院2025年作物学各方向大量接收调剂，包括作物遗传育种、作物栽培学与耕作学等。', reqs:['初试成绩达到农学国家A类线','本科为农学、生物等相关专业','接受跨专业调剂'], pub:'2025-03-16', dead:'2025-04-20', hot:1, year:2025 },
  { school:'西北农林科技大学', dept:'植物保护学院', subject:'植物保护', degree:'学术型硕士', vac:15, score:253, eng:34, math:0, prof:51, contact:'研招办', phone:'029-87082851', email:'yzb@nwsuaf.edu.cn', desc:'西北农林科技大学植物保护学院2025年接收植物保护方向调剂。', reqs:['初试成绩达到农学国家A类线','本科为植保、农学、生物等相关专业'], pub:'2025-03-18', dead:'2025-04-18', hot:0, year:2025 },
  { school:'西北农林科技大学', dept:'信息工程学院', subject:'计算机科学与技术', degree:'专业型硕士', vac:10, score:275, eng:38, math:57, prof:57, contact:'研招办', phone:'029-87082851', email:'yzb@nwsuaf.edu.cn', desc:'西北农林科技大学信息工程学院2025年计算机技术方向接收少量调剂，研究方向含智慧农业、农业大数据等。', reqs:['初试成绩达到工学国家A类线','本科为计算机、电子信息等相关专业'], pub:'2025-03-20', dead:'2025-04-12', hot:1, year:2025 },
  { school:'中国农业大学', dept:'工学院', subject:'农业工程', degree:'专业型硕士', vac:12, score:253, eng:34, math:51, prof:51, contact:'工学院研究生办', phone:'010-62736741', email:'gxy@cau.edu.cn', desc:'中国农业大学工学院2025年农业工程方向接收调剂，含农业机械化、农业电气化等方向。参考2025年文都考研调剂汇总。', reqs:['初试成绩达到农学国家A类线','本科为机械、电气、自动化等相关专业'], pub:'2025-03-22', dead:'2025-04-15', hot:0, year:2025 },
  { school:'中国海洋大学', dept:'水产学院', subject:'水产', degree:'学术型硕士', vac:12, score:253, eng:34, math:0, prof:51, contact:'研招办', phone:'0532-66782080', email:'yzb@ouc.edu.cn', desc:'中国海洋大学水产学院2025年接收水产养殖、水产动物医学等方向调剂。水产学科全国顶尖。', reqs:['初试成绩达到农学国家A类线','本科为水产、生物、动物科学等相关专业'], pub:'2025-03-19', dead:'2025-04-16', hot:0, year:2025 },
  { school:'中国海洋大学', dept:'环境科学与工程学院', subject:'环境科学与工程', degree:'学术型硕士', vac:8, score:275, eng:38, math:57, prof:57, contact:'研招办', phone:'0532-66782080', email:'yzb@ouc.edu.cn', desc:'中国海洋大学环境科学与工程学院2025年接收环境科学与工程方向调剂。含海洋环境等特色方向。', reqs:['初试成绩达到工学国家A类线','本科为环境、化学、生物等相关专业'], pub:'2025-03-21', dead:'2025-04-15', hot:0, year:2025 },
  { school:'东北大学', dept:'冶金学院', subject:'冶金工程', degree:'学术型硕士', vac:18, score:275, eng:38, math:57, prof:57, contact:'研招办', phone:'024-83687556', email:'yzb@mail.neu.edu.cn', desc:'东北大学冶金学院2025年冶金工程各方向接收调剂。冶金工程为东北大学传统优势学科。', reqs:['初试成绩达到工学国家A类线','本科为冶金、材料、化工等相关专业','有科研经历者优先'], pub:'2025-03-18', dead:'2025-04-14', hot:0, year:2025 },
  { school:'东北大学', dept:'资源与土木工程学院', subject:'矿业工程', degree:'学术型硕士', vac:12, score:275, eng:38, math:57, prof:57, contact:'研招办', phone:'024-83687556', email:'yzb@mail.neu.edu.cn', desc:'东北大学资源与土木工程学院2025年矿业工程方向接收调剂。', reqs:['初试成绩达到工学国家A类线','本科为矿业、土木、地质等相关专业'], pub:'2025-03-20', dead:'2025-04-16', hot:0, year:2025 },
  { school:'吉林大学', dept:'化学学院', subject:'化学', degree:'学术型硕士', vac:12, score:280, eng:40, math:60, prof:60, contact:'研招办', phone:'0431-85166420', email:'yzb@jlu.edu.cn', desc:'吉林大学化学学院2025年接收化学各方向调剂。无机合成与制备化学国家重点实验室所在学院。', reqs:['初试成绩达到理学国家A类线','本科为化学、应用化学等相关专业'], pub:'2025-03-19', dead:'2025-04-15', hot:0, year:2025 },
  { school:'吉林大学', dept:'材料科学与工程学院', subject:'材料科学与工程', degree:'学术型硕士', vac:10, score:275, eng:38, math:57, prof:57, contact:'研招办', phone:'0431-85166420', email:'yzb@jlu.edu.cn', desc:'吉林大学材料科学与工程学院2025年接收材料学方向调剂，包括金属材料、高分子材料等。', reqs:['初试成绩达到工学国家A类线','本科为材料、化学、物理等相关专业'], pub:'2025-03-20', dead:'2025-04-16', hot:0, year:2025 },
  { school:'山东大学', dept:'环境科学与工程学院', subject:'环境科学与工程', degree:'学术型硕士', vac:8, score:275, eng:38, math:57, prof:57, contact:'研招办', phone:'0531-88364334', email:'yzb@sdu.edu.cn', desc:'山东大学环境科学与工程学院2025年接收环境科学与工程方向调剂。', reqs:['初试成绩达到工学国家A类线','本科为环境、化学、生物等相关专业'], pub:'2025-03-22', dead:'2025-04-16', hot:0, year:2025 },
  { school:'四川大学', dept:'高分子科学与工程学院', subject:'材料科学与工程', degree:'学术型硕士', vac:10, score:275, eng:38, math:57, prof:57, contact:'研招办', phone:'028-85407437', email:'yzb@scu.edu.cn', desc:'四川大学高分子科学与工程学院2025年接收高分子化学与物理等方向调剂。高分子学科全国领先。', reqs:['初试成绩达到工学国家A类线','本科为高分子、材料、化学等相关专业'], pub:'2025-03-21', dead:'2025-04-15', hot:0, year:2025 },
  { school:'四川大学', dept:'生命科学学院', subject:'生物学', degree:'学术型硕士', vac:8, score:280, eng:40, math:0, prof:60, contact:'研招办', phone:'028-85407437', email:'yzb@scu.edu.cn', desc:'四川大学生命科学学院2025年接收生物学方向调剂。', reqs:['初试成绩达到理学国家A类线','本科为生物相关专业'], pub:'2025-03-23', dead:'2025-04-18', hot:0, year:2025 },
  { school:'重庆大学', dept:'环境与生态学院', subject:'环境科学与工程', degree:'学术型硕士', vac:10, score:275, eng:38, math:57, prof:57, contact:'研招办', phone:'023-65102374', email:'yzb@cqu.edu.cn', desc:'重庆大学环境与生态学院2025年接收环境科学与工程方向调剂。', reqs:['初试成绩达到工学国家A类线','本科为环境、化学、生物等相关专业'], pub:'2025-03-22', dead:'2025-04-16', hot:0, year:2025 },
  { school:'大连理工大学', dept:'材料科学与工程学院', subject:'材料科学与工程', degree:'学术型硕士', vac:10, score:275, eng:38, math:57, prof:57, contact:'研招办', phone:'0411-84708338', email:'yzb@dlut.edu.cn', desc:'大连理工大学材料科学与工程学院2025年接收材料学方向调剂。', reqs:['初试成绩达到工学国家A类线','本科为材料、化学、物理等相关专业'], pub:'2025-03-20', dead:'2025-04-14', hot:0, year:2025 },
  { school:'中南大学', dept:'冶金与环境学院', subject:'冶金工程', degree:'学术型硕士', vac:12, score:275, eng:38, math:57, prof:57, contact:'研招办', phone:'0731-88876806', email:'yzb@csu.edu.cn', desc:'中南大学冶金与环境学院2025年接收冶金工程方向调剂。冶金工程为中南大学传统强势学科。', reqs:['初试成绩达到工学国家A类线','本科为冶金、材料、化工等相关专业'], pub:'2025-03-19', dead:'2025-04-14', hot:0, year:2025 },
  { school:'湖南大学', dept:'生物学院', subject:'生物学', degree:'学术型硕士', vac:8, score:280, eng:40, math:0, prof:60, contact:'研招办', phone:'0731-88822856', email:'yzb@hnu.edu.cn', desc:'湖南大学生物学院2025年接收生物学方向调剂。', reqs:['初试成绩达到理学国家A类线','本科为生物相关专业'], pub:'2025-03-21', dead:'2025-04-15', hot:0, year:2025 },
  { school:'华南理工大学', dept:'化学与化工学院', subject:'化学工程与技术', degree:'学术型硕士', vac:8, score:275, eng:38, math:57, prof:57, contact:'研招办', phone:'020-87113401', email:'yzb@scut.edu.cn', desc:'华南理工大学化学与化工学院2025年化学工程方向接收调剂。', reqs:['初试成绩达到工学国家A类线','本科为化工、化学等相关专业'], pub:'2025-03-22', dead:'2025-04-16', hot:0, year:2025 },
  { school:'电子科技大学', dept:'材料与能源学院', subject:'材料科学与工程', degree:'学术型硕士', vac:6, score:275, eng:38, math:57, prof:57, contact:'研招办', phone:'028-61831096', email:'yzb@uestc.edu.cn', desc:'电子科技大学材料与能源学院2025年接收材料科学与工程方向调剂，含电子材料、新能源材料等方向。', reqs:['初试成绩达到工学国家A类线','本科为材料、化学、物理等相关专业'], pub:'2025-03-23', dead:'2025-04-15', hot:0, year:2025 },
  { school:'西安交通大学', dept:'化学工程与技术学院', subject:'化学工程与技术', degree:'学术型硕士', vac:6, score:275, eng:38, math:57, prof:57, contact:'研招办', phone:'029-82668329', email:'yzb@xjtu.edu.cn', desc:'西安交通大学化学工程与技术学院2025年化学工程方向接收调剂。', reqs:['初试成绩达到工学国家A类线','本科为化工、化学等相关专业'], pub:'2025-03-22', dead:'2025-04-14', hot:0, year:2025 },

  // ========== 2026 年 ==========
  { school:'兰州大学', dept:'化学化工学院', subject:'化学', degree:'学术型硕士', vac:16, score:282, eng:42, math:62, prof:62, contact:'招生办', phone:'0931-8912168', email:'yzb@lzu.edu.cn', desc:'兰州大学化学化工学院2026年接收化学各二级学科调剂。功能有机分子化学国家重点实验室所在学院，科研平台一流。', reqs:['初试成绩达到2026年国家A类线','本科为化学、应用化学等相关专业','优先接收第一志愿报考985/211考生','有科研论文或竞赛获奖者优先'], pub:'2026-03-10', dead:'2026-04-10', hot:1, year:2026 },
  { school:'兰州大学', dept:'草地农业科技学院', subject:'草学', degree:'学术型硕士', vac:25, score:255, eng:35, math:0, prof:52, contact:'招生办', phone:'0931-8912168', email:'yzb@lzu.edu.cn', desc:'兰州大学草地农业科技学院2026年草学方向大量接收调剂。草学学科全国排名第一，教育部A+学科。', reqs:['初试成绩达到农学国家A类线','本科为农学、生物、生态、草业等相关专业','接受跨专业调剂'], pub:'2026-03-08', dead:'2026-04-15', hot:1, year:2026 },
  { school:'兰州大学', dept:'生态学院', subject:'生态学', degree:'学术型硕士', vac:10, score:282, eng:42, math:0, prof:62, contact:'招生办', phone:'0931-8912168', email:'yzb@lzu.edu.cn', desc:'兰州大学生态学院2026年接收生态学方向调剂。干旱与草地生态教育部重点实验室所在学院。', reqs:['初试成绩达到理学国家A类线','本科为生态学、生物学、环境等相关专业'], pub:'2026-03-12', dead:'2026-04-12', hot:0, year:2026 },
  { school:'兰州大学', dept:'物理科学与技术学院', subject:'物理学', degree:'学术型硕士', vac:8, score:282, eng:42, math:62, prof:62, contact:'招生办', phone:'0931-8912168', email:'yzb@lzu.edu.cn', desc:'兰州大学物理科学与技术学院2026年接收理论物理、凝聚态物理等方向调剂。', reqs:['初试成绩达到理学国家A类线','本科为物理学相关专业'], pub:'2026-03-14', dead:'2026-04-12', hot:0, year:2026 },
  { school:'西北农林科技大学', dept:'农学院', subject:'作物学', degree:'学术型硕士', vac:30, score:255, eng:35, math:0, prof:52, contact:'研招办', phone:'029-87082851', email:'yzb@nwsuaf.edu.cn', desc:'西北农林科技大学农学院2026年作物学各方向大量接收调剂。旱区作物逆境生物学国家重点实验室科研条件优越。', reqs:['初试成绩达到农学国家A类线','本科为农学、生物相关专业','接受跨专业调剂'], pub:'2026-03-08', dead:'2026-04-18', hot:1, year:2026 },
  { school:'西北农林科技大学', dept:'林学院', subject:'林学', degree:'学术型硕士', vac:15, score:255, eng:35, math:0, prof:52, contact:'研招办', phone:'029-87082851', email:'yzb@nwsuaf.edu.cn', desc:'西北农林科技大学林学院2026年林学方向接收调剂。含森林培育、水土保持与荒漠化防治等方向。', reqs:['初试成绩达到农学国家A类线','本科为林学、生态、生物等相关专业'], pub:'2026-03-10', dead:'2026-04-16', hot:0, year:2026 },
  { school:'西北农林科技大学', dept:'食品科学与工程学院', subject:'食品科学与工程', degree:'专业型硕士', vac:15, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'029-87082851', email:'yzb@nwsuaf.edu.cn', desc:'西北农林科技大学食品科学与工程学院2026年接收食品工程等方向调剂。', reqs:['初试成绩达到工学国家A类线','本科为食品、化学、生物等相关专业'], pub:'2026-03-12', dead:'2026-04-14', hot:0, year:2026 },
  { school:'西北农林科技大学', dept:'化学与药学院', subject:'化学', degree:'学术型硕士', vac:10, score:282, eng:42, math:62, prof:62, contact:'研招办', phone:'029-87082851', email:'yzb@nwsuaf.edu.cn', desc:'西北农林科技大学化学与药学院2026年接收化学方向调剂。', reqs:['初试成绩达到理学国家A类线','本科为化学、药学等相关专业'], pub:'2026-03-14', dead:'2026-04-15', hot:0, year:2026 },
  { school:'中国农业大学', dept:'工学院', subject:'农业工程', degree:'专业型硕士', vac:10, score:255, eng:35, math:52, prof:52, contact:'工学院研究生办', phone:'010-62736741', email:'gxy@cau.edu.cn', desc:'中国农业大学工学院2026年农业工程方向接收调剂。智能农业装备与机器人为学院特色方向。', reqs:['初试成绩达到农学国家A类线','本科为机械、电气、自动化等相关专业'], pub:'2026-03-12', dead:'2026-04-10', hot:1, year:2026 },
  { school:'中国农业大学', dept:'水利与土木工程学院', subject:'农业水土工程', degree:'学术型硕士', vac:8, score:255, eng:35, math:52, prof:52, contact:'研招办', phone:'010-62737904', email:'yzb@cau.edu.cn', desc:'中国农业大学水利与土木工程学院2026年农业水土工程方向接收调剂。', reqs:['初试成绩达到农学国家A类线','本科为水利、土木等相关专业'], pub:'2026-03-14', dead:'2026-04-12', hot:0, year:2026 },
  { school:'中国海洋大学', dept:'水产学院', subject:'水产', degree:'学术型硕士', vac:15, score:255, eng:35, math:0, prof:52, contact:'研招办', phone:'0532-66782080', email:'yzb@ouc.edu.cn', desc:'中国海洋大学水产学院2026年接收水产养殖、渔业资源等方向调剂。水产学科全国排名前列。', reqs:['初试成绩达到农学国家A类线','本科为水产、生物、海洋等相关专业'], pub:'2026-03-10', dead:'2026-04-15', hot:1, year:2026 },
  { school:'中国海洋大学', dept:'食品科学与工程学院', subject:'食品科学与工程', degree:'专业型硕士', vac:8, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'0532-66782080', email:'yzb@ouc.edu.cn', desc:'中国海洋大学食品科学与工程学院2026年接收食品工程方向调剂。含海洋食品加工等特色方向。', reqs:['初试成绩达到工学国家A类线','本科为食品、化学、生物等相关专业'], pub:'2026-03-13', dead:'2026-04-14', hot:0, year:2026 },
  { school:'东北大学', dept:'冶金学院', subject:'冶金工程', degree:'学术型硕士', vac:16, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'024-83687556', email:'yzb@mail.neu.edu.cn', desc:'东北大学冶金学院2026年冶金工程各方向接收调剂。冶金学科为国家一流建设学科，全国排名前三。', reqs:['初试成绩达到工学国家A类线','本科为冶金、材料、化工等相关专业'], pub:'2026-03-10', dead:'2026-04-12', hot:1, year:2026 },
  { school:'东北大学', dept:'材料科学与工程学院', subject:'材料科学与工程', degree:'学术型硕士', vac:10, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'024-83687556', email:'yzb@mail.neu.edu.cn', desc:'东北大学材料科学与工程学院2026年接收材料科学方向调剂。', reqs:['初试成绩达到工学国家A类线','本科为材料、化学、物理等相关专业'], pub:'2026-03-12', dead:'2026-04-14', hot:0, year:2026 },
  { school:'吉林大学', dept:'化学学院', subject:'化学', degree:'学术型硕士', vac:14, score:282, eng:42, math:62, prof:62, contact:'研招办', phone:'0431-85166420', email:'yzb@jlu.edu.cn', desc:'吉林大学化学学院2026年接收化学各方向调剂。国家重点实验室科研条件优越。', reqs:['初试成绩达到理学国家A类线','本科为化学相关专业','有科研论文者优先'], pub:'2026-03-11', dead:'2026-04-14', hot:0, year:2026 },
  { school:'吉林大学', dept:'地球科学学院', subject:'地质学', degree:'学术型硕士', vac:10, score:282, eng:42, math:62, prof:62, contact:'研招办', phone:'0431-85166420', email:'yzb@jlu.edu.cn', desc:'吉林大学地球科学学院2026年接收地质学方向调剂。地质学为国家一流建设学科。', reqs:['初试成绩达到理学国家A类线','本科为地质、地球物理等相关专业'], pub:'2026-03-13', dead:'2026-04-16', hot:0, year:2026 },
  { school:'山东大学', dept:'化学与化工学院', subject:'化学', degree:'学术型硕士', vac:10, score:282, eng:42, math:62, prof:62, contact:'研招办', phone:'0531-88364334', email:'yzb@sdu.edu.cn', desc:'山东大学化学与化工学院2026年接收化学各方向调剂。', reqs:['初试成绩达到理学国家A类线','本科为化学相关专业'], pub:'2026-03-12', dead:'2026-04-14', hot:0, year:2026 },
  { school:'山东大学', dept:'控制科学与工程学院', subject:'控制科学与工程', degree:'专业型硕士', vac:6, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'0531-88364334', email:'yzb@sdu.edu.cn', desc:'山东大学控制科学与工程学院2026年接收控制工程方向少量调剂。', reqs:['初试成绩达到工学国家A类线','本科为自动化、电气、计算机等相关专业'], pub:'2026-03-14', dead:'2026-04-10', hot:0, year:2026 },
  { school:'四川大学', dept:'化学学院', subject:'化学', degree:'学术型硕士', vac:10, score:282, eng:42, math:62, prof:62, contact:'研招办', phone:'028-85407437', email:'yzb@scu.edu.cn', desc:'四川大学化学学院2026年接收化学各方向调剂。', reqs:['初试成绩达到理学国家A类线','本科为化学相关专业'], pub:'2026-03-11', dead:'2026-04-14', hot:0, year:2026 },
  { school:'四川大学', dept:'水利水电学院', subject:'水利工程', degree:'专业型硕士', vac:10, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'028-85407437', email:'yzb@scu.edu.cn', desc:'四川大学水利水电学院2026年水利工程方向接收调剂。', reqs:['初试成绩达到工学国家A类线','本科为水利、土木等相关专业'], pub:'2026-03-13', dead:'2026-04-12', hot:0, year:2026 },
  { school:'重庆大学', dept:'材料科学与工程学院', subject:'材料科学与工程', degree:'学术型硕士', vac:10, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'023-65102374', email:'yzb@cqu.edu.cn', desc:'重庆大学材料科学与工程学院2026年接收材料学方向调剂。', reqs:['初试成绩达到工学国家A类线','本科为材料、化学、物理等相关专业'], pub:'2026-03-12', dead:'2026-04-14', hot:0, year:2026 },
  { school:'重庆大学', dept:'光电工程学院', subject:'光学工程', degree:'学术型硕士', vac:6, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'023-65102374', email:'yzb@cqu.edu.cn', desc:'重庆大学光电工程学院2026年光学工程方向接收少量调剂。', reqs:['初试成绩达到工学国家A类线','本科为光学、电子、物理等相关专业'], pub:'2026-03-14', dead:'2026-04-10', hot:0, year:2026 },
  { school:'湖南大学', dept:'化学化工学院', subject:'化学工程与技术', degree:'学术型硕士', vac:8, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'0731-88822856', email:'yzb@hnu.edu.cn', desc:'湖南大学化学化工学院2026年化学工程方向接收调剂。', reqs:['初试成绩达到工学国家A类线','本科为化工、化学等相关专业'], pub:'2026-03-12', dead:'2026-04-14', hot:0, year:2026 },
  { school:'湖南大学', dept:'环境科学与工程学院', subject:'环境科学与工程', degree:'学术型硕士', vac:6, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'0731-88822856', email:'yzb@hnu.edu.cn', desc:'湖南大学环境科学与工程学院2026年环境工程方向接收调剂。', reqs:['初试成绩达到工学国家A类线','本科为环境、化学等相关专业'], pub:'2026-03-14', dead:'2026-04-12', hot:0, year:2026 },
  { school:'中南大学', dept:'冶金与环境学院', subject:'冶金工程', degree:'学术型硕士', vac:14, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'0731-88876806', email:'yzb@csu.edu.cn', desc:'中南大学冶金与环境学院2026年冶金工程方向接收调剂。有色金属冶金为全国顶尖学科。', reqs:['初试成绩达到工学国家A类线','本科为冶金、材料、化工等相关专业'], pub:'2026-03-10', dead:'2026-04-14', hot:1, year:2026 },
  { school:'中南大学', dept:'地球科学与信息物理学院', subject:'地质资源与地质工程', degree:'学术型硕士', vac:8, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'0731-88876806', email:'yzb@csu.edu.cn', desc:'中南大学地球科学与信息物理学院2026年接收地质方向调剂。', reqs:['初试成绩达到工学国家A类线','本科为地质、测绘等相关专业'], pub:'2026-03-13', dead:'2026-04-12', hot:0, year:2026 },
  { school:'大连理工大学', dept:'化工学院', subject:'化学工程与技术', degree:'学术型硕士', vac:8, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'0411-84708338', email:'yzb@dlut.edu.cn', desc:'大连理工大学化工学院2026年化学工程方向接收调剂。化学工程与技术为一流建设学科。', reqs:['初试成绩达到工学国家A类线','本科为化工、化学等相关专业'], pub:'2026-03-12', dead:'2026-04-14', hot:0, year:2026 },
  { school:'华南理工大学', dept:'材料科学与工程学院', subject:'材料科学与工程', degree:'学术型硕士', vac:8, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'020-87113401', email:'yzb@scut.edu.cn', desc:'华南理工大学材料科学与工程学院2026年接收材料学方向调剂。', reqs:['初试成绩达到工学国家A类线','本科为材料、化学、物理等相关专业'], pub:'2026-03-13', dead:'2026-04-15', hot:0, year:2026 },
  { school:'电子科技大学', dept:'材料与能源学院', subject:'材料科学与工程', degree:'学术型硕士', vac:6, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'028-61831096', email:'yzb@uestc.edu.cn', desc:'电子科技大学材料与能源学院2026年接收材料方向调剂。含电子功能材料、新能源材料等特色方向。', reqs:['初试成绩达到工学国家A类线','本科为材料、化学、物理等相关专业'], pub:'2026-03-14', dead:'2026-04-12', hot:0, year:2026 },
  { school:'西安交通大学', dept:'生命科学与技术学院', subject:'生物医学工程', degree:'学术型硕士', vac:5, score:278, eng:39, math:58, prof:58, contact:'研招办', phone:'029-82668329', email:'yzb@xjtu.edu.cn', desc:'西安交通大学生命科学与技术学院2026年生物医学工程方向接收少量调剂。', reqs:['初试成绩达到工学国家A类线','本科为生物医学工程、电子、计算机等相关专业'], pub:'2026-03-14', dead:'2026-04-10', hot:0, year:2026 },
  { school:'厦门大学', dept:'海洋与地球学院', subject:'海洋科学', degree:'学术型硕士', vac:6, score:282, eng:42, math:62, prof:62, contact:'研招办', phone:'0592-2188888', email:'yzb@xmu.edu.cn', desc:'厦门大学海洋与地球学院2026年海洋科学方向接收调剂。海洋科学为国家一流建设学科。', reqs:['初试成绩达到理学国家A类线','本科为海洋、化学、生物、地质等相关专业'], pub:'2026-03-12', dead:'2026-04-12', hot:0, year:2026 },
  { school:'中央民族大学', dept:'理学院', subject:'数学', degree:'学术型硕士', vac:6, score:282, eng:42, math:62, prof:62, contact:'研招办', phone:'010-68932544', email:'yzb@muc.edu.cn', desc:'中央民族大学理学院2026年数学方向接收调剂。', reqs:['初试成绩达到理学国家A类线','本科为数学相关专业'], pub:'2026-03-15', dead:'2026-04-15', hot:0, year:2026 },
];

function seed() {
  const insertSchool = db.prepare('INSERT INTO schools (name, logo, location, type, category, description, website) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertDept = db.prepare('INSERT INTO departments (school_id, name) VALUES (?, ?)');
  const insertListing = db.prepare(`INSERT INTO listings (school_id, school_name, department, subject, degree, location, vacancies, score_requirement, english_requirement, math_requirement, professional_requirement, contact, phone, email, description, requirements, publish_date, deadline, status, is_hot, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertUser = db.prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)');

  const colorMap = { '北京':'1e40af','天津':'7c3aed','辽宁':'0891b2','吉林':'ea580c','黑龙江':'b91c1c','上海':'dc2626','江苏':'059669','浙江':'0e7490','安徽':'4338ca','福建':'166534','山东':'1d4ed8','湖北':'7c3aed','湖南':'d97706','广东':'be123c','四川':'4f46e5','重庆':'0369a1','陕西':'9333ea','甘肃':'c2410c' };
  function logo(name, loc) {
    const short = name.length > 4 ? name.substring(0, 2) : name.substring(0, 2);
    const color = colorMap[loc] || '6b7280';
    return `https://placehold.co/80x80/${color}/ffffff?text=${encodeURIComponent(short)}`;
  }

  const transaction = db.transaction(() => {
    const schoolMap = {};
    for (const s of schoolsData) {
      const result = insertSchool.run(s.name, logo(s.name, s.location), s.location, s.type, s.category, s.desc, s.web);
      schoolMap[s.name] = { id: result.lastInsertRowid, location: s.location };
      for (const d of s.depts) insertDept.run(result.lastInsertRowid, d);
    }

    for (const l of listingsData) {
      const s = schoolMap[l.school];
      if (!s) { console.warn(`School not found: ${l.school}`); continue; }
      const status = l.year < 2026 ? 'closed' : 'active';
      insertListing.run(s.id, l.school, l.dept, l.subject, l.degree, s.location, l.vac, l.score, l.eng, l.math, l.prof, l.contact, l.phone, l.email, l.desc, JSON.stringify(l.reqs), l.pub, l.dead, status, l.hot, l.year);
    }

    const hashed = bcrypt.hashSync('demo123456', 10);
    insertUser.run('演示用户', 'demo@example.com', '13800138000', hashed, 'student');
    insertUser.run('管理员', 'admin@example.com', '13900139000', bcrypt.hashSync('admin123456', 10), 'admin');
  });

  transaction();
  console.log(`Database seeded: ${schoolsData.length} schools, ${listingsData.length} listings.`);
}

export default db;
