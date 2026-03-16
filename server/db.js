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
  if (count.c === 0) {
    seed();
  }
}

function seed() {
  const insertSchool = db.prepare(
    'INSERT INTO schools (name, logo, location, type, category, description, website) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const insertDept = db.prepare('INSERT INTO departments (school_id, name) VALUES (?, ?)');
  const insertListing = db.prepare(`
    INSERT INTO listings (school_id, school_name, department, subject, degree, location, vacancies,
      score_requirement, english_requirement, math_requirement, professional_requirement,
      contact, phone, email, description, requirements, publish_date, deadline, status, is_hot)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertUser = db.prepare(
    'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)'
  );

  const schoolsData = [
    { name: '北京大学', logo: 'https://placehold.co/80x80/1e40af/ffffff?text=北大', location: '北京', type: '985/211', category: '综合类', description: '北京大学创办于1898年，是中国第一所国立综合性大学，也是最具精神魅力和学府气质的大学。', website: 'https://www.pku.edu.cn', departments: ['计算机科学与技术', '软件工程', '人工智能', '电子信息'] },
    { name: '清华大学', logo: 'https://placehold.co/80x80/7c3aed/ffffff?text=清华', location: '北京', type: '985/211', category: '理工类', description: '清华大学是中国著名高等学府，坐落于北京，是中国高层次人才培养和科学技术研究的重要基地。', website: 'https://www.tsinghua.edu.cn', departments: ['计算机科学与技术', '电子工程', '自动化', '材料科学'] },
    { name: '浙江大学', logo: 'https://placehold.co/80x80/0891b2/ffffff?text=浙大', location: '浙江', type: '985/211', category: '综合类', description: '浙江大学是一所历史悠久、声誉卓著的高等学府，坐落于中国历史文化名城杭州。', website: 'https://www.zju.edu.cn', departments: ['计算机科学与技术', '控制科学与工程', '光学工程', '生物医学工程'] },
    { name: '复旦大学', logo: 'https://placehold.co/80x80/dc2626/ffffff?text=复旦', location: '上海', type: '985/211', category: '综合类', description: '复旦大学是中华人民共和国教育部直属的全国重点大学，中央直管高校。', website: 'https://www.fudan.edu.cn', departments: ['计算机科学与技术', '数学', '物理学', '经济学'] },
    { name: '上海交通大学', logo: 'https://placehold.co/80x80/ea580c/ffffff?text=交大', location: '上海', type: '985/211', category: '理工类', description: '上海交通大学是教育部直属并与上海市共建的全国重点大学，享有极高的学术声誉。', website: 'https://www.sjtu.edu.cn', departments: ['电子信息与电气工程', '机械与动力工程', '船舶海洋与建筑工程'] },
    { name: '南京大学', logo: 'https://placehold.co/80x80/7c3aed/ffffff?text=南大', location: '江苏', type: '985/211', category: '综合类', description: '南京大学坐落于钟灵毓秀、虎踞龙蟠的金陵古都，是一所历史悠久、声誉卓著的百年名校。', website: 'https://www.nju.edu.cn', departments: ['计算机科学与技术', '天文学', '物理学', '化学'] },
    { name: '武汉大学', logo: 'https://placehold.co/80x80/059669/ffffff?text=武大', location: '湖北', type: '985/211', category: '综合类', description: '武汉大学溯源于1893年清末湖广总督创办的自强学堂，历经传承演变。', website: 'https://www.whu.edu.cn', departments: ['计算机学院', '遥感信息工程', '测绘学院', '水利水电学院'] },
    { name: '华中科技大学', logo: 'https://placehold.co/80x80/b91c1c/ffffff?text=华科', location: '湖北', type: '985/211', category: '理工类', description: '华中科技大学是国家教育部直属重点综合性大学，是国家"211工程"重点建设和"985工程"建设高校。', website: 'https://www.hust.edu.cn', departments: ['计算机科学与技术', '电子信息与通信', '机械科学与工程', '光学与电子信息'] },
    { name: '中山大学', logo: 'https://placehold.co/80x80/166534/ffffff?text=中大', location: '广东', type: '985/211', category: '综合类', description: '中山大学由孙中山先生创办，有着一百多年办学传统，是中国南方科学研究、文化学术与人才培养的重镇。', website: 'https://www.sysu.edu.cn', departments: ['计算机学院', '数据科学与计算机学院', '电子与信息工程学院'] },
    { name: '西安交通大学', logo: 'https://placehold.co/80x80/1d4ed8/ffffff?text=西交', location: '陕西', type: '985/211', category: '理工类', description: '西安交通大学是我国最早兴办的高等学府之一，是教育部直属重点大学。', website: 'https://www.xjtu.edu.cn', departments: ['电子与信息学部', '机械工程学院', '能源与动力工程学院'] },
    { name: '北京理工大学', logo: 'https://placehold.co/80x80/4338ca/ffffff?text=北理', location: '北京', type: '985/211', category: '理工类', description: '北京理工大学是中国共产党创办的第一所理工科大学，隶属于工业和信息化部。', website: 'https://www.bit.edu.cn', departments: ['计算机学院', '自动化学院', '信息与电子学院', '机械与车辆学院'] },
    { name: '东南大学', logo: 'https://placehold.co/80x80/0e7490/ffffff?text=东南', location: '江苏', type: '985/211', category: '理工类', description: '东南大学是中央直管、教育部直属的全国重点大学，著名的建筑老八校及原四大工学院之一。', website: 'https://www.seu.edu.cn', departments: ['计算机科学与工程', '信息科学与工程', '建筑学院', '土木工程学院'] },
  ];

  const listingsData = [
    { schoolIdx: 0, department: '信息科学技术学院', subject: '计算机科学与技术', degree: '学术型硕士', vacancies: 3, score: 360, english: 60, math: 90, professional: 100, contact: '张老师', phone: '010-62751234', email: 'cs_transfer@pku.edu.cn', description: '北京大学信息科学技术学院计算机科学与技术专业现有少量调剂名额。要求考生初试成绩优异，具有较强的编程能力和科研潜力。欢迎来自985/211院校的优秀考生申请。', requirements: JSON.stringify(['本科为计算机相关专业', '初试总分不低于360分', '英语不低于60分', '具有ACM/ICPC等竞赛经历者优先']), publishDate: '2026-03-10', deadline: '2026-04-05', isHot: 1 },
    { schoolIdx: 2, department: '计算机科学与技术学院', subject: '人工智能', degree: '专业型硕士', vacancies: 5, score: 350, english: 55, math: 85, professional: 95, contact: '李老师', phone: '0571-87951234', email: 'ai_transfer@zju.edu.cn', description: '浙江大学计算机科学与技术学院人工智能专业因部分考生放弃录取资格，现接受调剂申请。研究方向包括机器学习、自然语言处理、计算机视觉等。', requirements: JSON.stringify(['本科为计算机、数学、统计等相关专业', '初试总分不低于350分', '有机器学习相关研究经历者优先', '发表过相关学术论文者优先']), publishDate: '2026-03-12', deadline: '2026-04-10', isHot: 1 },
    { schoolIdx: 3, department: '计算机科学技术学院', subject: '软件工程', degree: '专业型硕士', vacancies: 4, score: 345, english: 55, math: 80, professional: 90, contact: '王老师', phone: '021-65641234', email: 'se_transfer@fudan.edu.cn', description: '复旦大学计算机科学技术学院软件工程专业接受调剂。培养方向涵盖大数据技术、云计算、移动互联网等方向。', requirements: JSON.stringify(['本科为计算机、软件工程相关专业', '初试总分不低于345分', '具有较好的软件开发实践能力']), publishDate: '2026-03-08', deadline: '2026-04-03', isHot: 1 },
    { schoolIdx: 4, department: '电子信息与电气工程学院', subject: '电子信息', degree: '专业型硕士', vacancies: 6, score: 340, english: 50, math: 80, professional: 90, contact: '赵老师', phone: '021-34201234', email: 'ee_transfer@sjtu.edu.cn', description: '上海交通大学电子信息与电气工程学院电子信息专业硕士接受调剂。研究方向包括集成电路设计、信号处理、嵌入式系统等。', requirements: JSON.stringify(['本科为电子、通信、计算机等相关专业', '初试总分不低于340分', '具有相关项目经验者优先']), publishDate: '2026-03-11', deadline: '2026-04-08', isHot: 0 },
    { schoolIdx: 6, department: '计算机学院', subject: '计算机科学与技术', degree: '学术型硕士', vacancies: 8, score: 330, english: 50, math: 75, professional: 85, contact: '刘老师', phone: '027-68751234', email: 'cs_transfer@whu.edu.cn', description: '武汉大学计算机学院计算机科学与技术专业招收调剂生。学院拥有国家重点实验室，科研条件优越，欢迎优秀考生申请。', requirements: JSON.stringify(['本科为计算机相关专业', '初试总分不低于330分', '有科研经历或竞赛获奖者优先']), publishDate: '2026-03-13', deadline: '2026-04-12', isHot: 0 },
    { schoolIdx: 7, department: '计算机科学与技术学院', subject: '软件工程', degree: '专业型硕士', vacancies: 10, score: 325, english: 50, math: 75, professional: 85, contact: '陈老师', phone: '027-87541234', email: 'se_transfer@hust.edu.cn', description: '华中科技大学计算机科学与技术学院软件工程专业接受调剂。学院在系统软件、大数据等方面有较强的学科优势。', requirements: JSON.stringify(['本科为计算机、软件工程等相关专业', '初试总分不低于325分', '具有良好的编程基础']), publishDate: '2026-03-14', deadline: '2026-04-15', isHot: 0 },
    { schoolIdx: 5, department: '计算机科学与技术系', subject: '计算机科学与技术', degree: '学术型硕士', vacancies: 2, score: 355, english: 60, math: 85, professional: 95, contact: '孙老师', phone: '025-89681234', email: 'cs_transfer@nju.edu.cn', description: '南京大学计算机科学与技术系有少量调剂名额。南大计算机学科在全国排名前列，欢迎学术志向明确的考生申请。', requirements: JSON.stringify(['本科为计算机科学相关专业', '初试总分不低于355分', '英语和数学成绩优秀', '有学术论文或科研经历者优先']), publishDate: '2026-03-09', deadline: '2026-04-06', isHot: 1 },
    { schoolIdx: 8, department: '数据科学与计算机学院', subject: '人工智能', degree: '学术型硕士', vacancies: 4, score: 335, english: 55, math: 80, professional: 90, contact: '周老师', phone: '020-84111234', email: 'ai_transfer@sysu.edu.cn', description: '中山大学数据科学与计算机学院人工智能方向接受调剂。学院在智能计算、数据挖掘等领域有丰富的研究积累。', requirements: JSON.stringify(['本科为计算机、数学、统计等相关专业', '初试总分不低于335分', '有编程能力和数学基础']), publishDate: '2026-03-15', deadline: '2026-04-18', isHot: 0 },
    { schoolIdx: 9, department: '电子与信息学部', subject: '通信工程', degree: '专业型硕士', vacancies: 7, score: 320, english: 48, math: 72, professional: 82, contact: '吴老师', phone: '029-82661234', email: 'comm_transfer@xjtu.edu.cn', description: '西安交通大学电子与信息学部通信工程方向接受调剂申请。研究方向涵盖5G通信、物联网、信息安全等前沿领域。', requirements: JSON.stringify(['本科为通信、电子、计算机等相关专业', '初试总分不低于320分', '有相关实习或项目经验者优先']), publishDate: '2026-03-13', deadline: '2026-04-11', isHot: 0 },
    { schoolIdx: 10, department: '计算机学院', subject: '计算机科学与技术', degree: '学术型硕士', vacancies: 5, score: 338, english: 52, math: 78, professional: 88, contact: '马老师', phone: '010-68911234', email: 'cs_transfer@bit.edu.cn', description: '北京理工大学计算机学院接受计算机科学与技术方向的调剂考生。学院在网络安全、智能信息处理等方面有显著优势。', requirements: JSON.stringify(['本科为计算机相关专业', '初试总分不低于338分', '有网络安全或信息处理相关经历者优先']), publishDate: '2026-03-11', deadline: '2026-04-09', isHot: 0 },
    { schoolIdx: 11, department: '计算机科学与工程学院', subject: '软件工程', degree: '专业型硕士', vacancies: 6, score: 328, english: 50, math: 76, professional: 86, contact: '黄老师', phone: '025-83791234', email: 'se_transfer@seu.edu.cn', description: '东南大学计算机科学与工程学院软件工程专业接受调剂。研究方向包括软件体系结构、软件测试、DevOps等。', requirements: JSON.stringify(['本科为计算机、软件工程相关专业', '初试总分不低于328分', '有软件开发项目经验者优先']), publishDate: '2026-03-14', deadline: '2026-04-13', isHot: 0 },
    { schoolIdx: 1, department: '交叉信息研究院', subject: '人工智能', degree: '学术型硕士', vacancies: 1, score: 380, english: 65, math: 100, professional: 110, contact: '林老师', phone: '010-62781234', email: 'ai_transfer@tsinghua.edu.cn', description: '清华大学交叉信息研究院（姚班）人工智能方向有极少量调剂名额。要求考生具有极其出色的数学和编程能力。', requirements: JSON.stringify(['本科为计算机、数学等顶尖专业', '初试总分不低于380分', '数学和专业课成绩极为突出', '有顶级会议论文发表者优先', '有IOI/NOI等信息学竞赛经历者优先']), publishDate: '2026-03-15', deadline: '2026-03-28', isHot: 1 },
  ];

  const transaction = db.transaction(() => {
    const schoolIds = [];
    for (const s of schoolsData) {
      const result = insertSchool.run(s.name, s.logo, s.location, s.type, s.category, s.description, s.website);
      schoolIds.push(result.lastInsertRowid);
      for (const dept of s.departments) {
        insertDept.run(result.lastInsertRowid, dept);
      }
    }

    for (const l of listingsData) {
      const schoolId = schoolIds[l.schoolIdx];
      const schoolName = schoolsData[l.schoolIdx].name;
      const location = schoolsData[l.schoolIdx].location;
      insertListing.run(
        schoolId, schoolName, l.department, l.subject, l.degree, location,
        l.vacancies, l.score, l.english, l.math, l.professional,
        l.contact, l.phone, l.email, l.description, l.requirements,
        l.publishDate, l.deadline, 'active', l.isHot
      );
    }

    const hashedPassword = bcrypt.hashSync('demo123456', 10);
    insertUser.run('演示用户', 'demo@example.com', '13800138000', hashedPassword, 'student');
    insertUser.run('管理员', 'admin@example.com', '13900139000', bcrypt.hashSync('admin123456', 10), 'admin');
  });

  transaction();
  console.log('Database seeded successfully.');
}

export default db;
