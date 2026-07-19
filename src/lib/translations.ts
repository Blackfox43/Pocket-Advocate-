export type Language = "en" | "es" | "zh" | "vi";

export interface TranslationSet {
  brandName: string;
  brandTagline: string;
  activeAssist: string;
  howItWorks: string;
  counselingSuite: string;
  playground: string;
  aiChat: string;
  rightsLibrary: string;
  rehearsalCoach: string;
  letterhead: string;
  mockArbitrator: string;
  upgradeToPro: string;
  dashboard: string;
  signInProfile: string;
  telemetryText: string;
  
  // Counseling / Input view
  guidedIntake: string;
  recordVoice: string;
  textCopier: string;
  newConsult: string;
  selectCategory: string;
  opponentPlaceholder: string;
  opponentLabel: string;
  analyzeButton: string;
  analyzingButton: string;
  presetTitle: string;
  presetDesc: string;

  // Categories
  catLandlord: string;
  catEmployer: string;
  catInsurance: string;
  catGeneral: string;

  // Idle Screen
  idleTitle: string;
  idleSubtitle: string;
  idleStep1: string;
  idleStep2: string;
  idleStep3: string;
  standardActs: string;
  civicProtection: string;

  // Analysis Display
  consultationTitle: string;
  consultationSub: string;
  saveToProfile: string;
  signInToSave: string;
  riskLevel: string;
  riskLow: string;
  riskMedium: string;
  riskHigh: string;
  summaryTitle: string;
  violationsTitle: string;
  violationsEmpty: string;
  responseArmorTitle: string;
  rationaleLabel: string;
  copyText: string;
  copiedText: string;
  speakText: string;
  stopText: string;

  // Common buttons
  closeBtn: string;
  backBtn: string;
  submitBtn: string;
}

export const languages: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" }
];

export const translations: Record<Language, TranslationSet> = {
  en: {
    brandName: "AI Pocket Advocate",
    brandTagline: "Defend your civilian, tenant, & employee rights during verbal disputes.",
    activeAssist: "ACTIVE ASSIST",
    howItWorks: "How it works",
    counselingSuite: "Counseling Suite",
    playground: "Scenario Playground",
    aiChat: "Legal AI Chat",
    rightsLibrary: "Rights Library",
    rehearsalCoach: "Vocal Coach",
    letterhead: "Certified Letterhead",
    mockArbitrator: "Mock Court",
    upgradeToPro: "✨ Upgrade to Pro",
    dashboard: "Dashboard",
    signInProfile: "Sign In / Profile",
    telemetryText: "67% of tenants unaware of basic rights",

    guidedIntake: "Guided Intake",
    recordVoice: "Record Voice",
    textCopier: "Text Copier",
    newConsult: "NEW CONSULT",
    selectCategory: "Select dispute category...",
    opponentPlaceholder: "Name of Opponent...",
    opponentLabel: "Opposing Party Name (e.g., Landlord, Boss)",
    analyzeButton: "⚡ Analyze Conversation",
    analyzingButton: "🔍 Auditing Rights...",
    presetTitle: "Preset Dispute Blueprints",
    presetDesc: "Test Pocket Advocate using preconfigured scenarios",

    catLandlord: "Tenant vs. Landlord",
    catEmployer: "Employee vs. Employer",
    catInsurance: "Insurance Claim Dispute",
    catGeneral: "General Rights Issue",

    idleTitle: "Pocket Advocate Ready for Consultation",
    idleSubtitle: "Record a conversation, enter text, or complete guided intake. Pocket Advocate will instantly:",
    idleStep1: "Transcribe and translate dialogue to capture verbal assertions.",
    idleStep2: "Audit rights violations referencing standard consumer/worker acts.",
    idleStep3: "Whisper strategic reply templates tailored as Firm, Legal, or Polite armor.",
    standardActs: "Standard Acts Covered",
    civicProtection: "Civic Protection Guaranteed",

    consultationTitle: "Advocate Rights Consultation",
    consultationSub: "Formulated using standard legal frameworks & tenant/employee protections.",
    saveToProfile: "Save to Profile",
    signInToSave: "Sign In to Save",
    riskLevel: "RISK LEVEL",
    riskLow: "LOW",
    riskMedium: "MEDIUM",
    riskHigh: "HIGH",
    summaryTitle: "Tactical Situation Summary",
    violationsTitle: "Detected Shady Claims & Rights Violations",
    violationsEmpty: "No major rights violations or high-pressure claims detected in this conversation. Continue being cautious.",
    responseArmorTitle: "Formulated Response Armor",
    rationaleLabel: "Tactical Rationale",
    copyText: "Copy Script",
    copiedText: "Copied!",
    speakText: "Listen Aloud",
    stopText: "Stop Audio",

    closeBtn: "Close",
    backBtn: "Back",
    submitBtn: "Submit"
  },
  es: {
    brandName: "Abogado de Bolsillo IA",
    brandTagline: "Defienda sus derechos civiles, de inquilino y empleado durante disputas verbales.",
    activeAssist: "ASISTENCIA ACTIVA",
    howItWorks: "Cómo funciona",
    counselingSuite: "Sala de Asesoría",
    playground: "Simulador de Casos",
    aiChat: "Chat de IA Legal",
    rightsLibrary: "Biblioteca de Derechos",
    rehearsalCoach: "Entrenador de Voz",
    letterhead: "Carta Certificada",
    mockArbitrator: "Simulador de Corte",
    upgradeToPro: "✨ Subir a Pro",
    dashboard: "Panel de Control",
    signInProfile: "Iniciar Sesión / Perfil",
    telemetryText: "67% de inquilinos desconocen sus derechos básicos",

    guidedIntake: "Entrada Guiada",
    recordVoice: "Grabar Voz",
    textCopier: "Copiar Texto",
    newConsult: "NUEVA CONSULTA",
    selectCategory: "Seleccione categoría de disputa...",
    opponentPlaceholder: "Nombre del Oponente...",
    opponentLabel: "Nombre de la Parte Opositora (ej. Casero, Jefe)",
    analyzeButton: "⚡ Analizar Conversación",
    analyzingButton: "🔍 Auditando Derechos...",
    presetTitle: "Casos Predeterminados",
    presetDesc: "Pruebe el Abogado de Bolsillo usando escenarios preconfigurados",

    catLandlord: "Inquilino vs. Casero",
    catEmployer: "Empleado vs. Patrón",
    catInsurance: "Disputa de Reclamación de Seguro",
    catGeneral: "Problema de Derechos Generales",

    idleTitle: "Abogado de Bolsillo Listo para Consulta",
    idleSubtitle: "Grabe una conversación, ingrese texto o complete la entrada guiada. El Abogado de Bolsillo al instante:",
    idleStep1: "Transcribirá y traducirá el diálogo para registrar declaraciones verbales.",
    idleStep2: "Auditará violaciones de derechos referenciando leyes estándar de protección.",
    idleStep3: "Sugerirá plantillas de respuesta tácticas (Firme, Legal o Cortés) como armadura verbal.",
    standardActs: "Leyes Estándar Cubiertas",
    civicProtection: "Protección Cívica Garantizada",

    consultationTitle: "Consulta de Derechos de Defensa",
    consultationSub: "Formulado usando marcos legales estándar y protecciones para inquilinos/empleados.",
    saveToProfile: "Guardar en Perfil",
    signInToSave: "Iniciar Sesión para Guardar",
    riskLevel: "NIVEL DE RIESGO",
    riskLow: "BAJO",
    riskMedium: "MEDIO",
    riskHigh: "ALTO",
    summaryTitle: "Resumen de la Situación Táctica",
    violationsTitle: "Reclamaciones Sospechosas y Violaciones de Derechos",
    violationsEmpty: "No se detectaron violaciones graves de derechos ni demandas de alta presión en esta conversación. Siga siendo precavido.",
    responseArmorTitle: "Armadura de Respuesta Formulada",
    rationaleLabel: "Razón Táctica",
    copyText: "Copiar Guion",
    copiedText: "¡Copiado!",
    speakText: "Escuchar en Voz Alta",
    stopText: "Detener Audio",

    closeBtn: "Cerrar",
    backBtn: "Atrás",
    submitBtn: "Enviar"
  },
  zh: {
    brandName: "AI 口袋法律卫士",
    brandTagline: "在口头纠纷中捍卫您的公民、租户和雇员权利。",
    activeAssist: "在线助手",
    howItWorks: "工作原理",
    counselingSuite: "咨询服务",
    playground: "纠纷场景模拟",
    aiChat: "法律 AI 问答",
    rightsLibrary: "权利法典库",
    rehearsalCoach: "对话排练教练",
    letterhead: "正式存证信函",
    mockArbitrator: "AI 模拟法庭",
    upgradeToPro: "✨ 升级到 Pro",
    dashboard: "个人控制面板",
    signInProfile: "登录 / 个人资料",
    telemetryText: "67% 的租户不了解基本合法权利",

    guidedIntake: "引导式登记",
    recordVoice: "录制语音",
    textCopier: "文本复制粘贴",
    newConsult: "新咨询",
    selectCategory: "选择争议类别...",
    opponentPlaceholder: "对方姓名/称呼...",
    opponentLabel: "对方名称（如房东、老板）",
    analyzeButton: "⚡ 分析对话内容",
    analyzingButton: "🔍 正在审查合法权益...",
    presetTitle: "预设纠纷蓝图模板",
    presetDesc: "使用预配置的场景测试口袋法律卫士",

    catLandlord: "租户 vs. 房东",
    catEmployer: "员工 vs. 雇主",
    catInsurance: "保险理赔纠纷",
    catGeneral: "常规权益保护",

    idleTitle: "口袋法律卫士已准备就绪",
    idleSubtitle: "录音、输入文字或完成引导登记。口袋法律卫士将立即：",
    idleStep1: "转录并翻译对话，精准捕捉口头承诺或威胁。",
    idleStep2: "对照标准消费者/劳工法案审查是否存在侵权或违法诉求。",
    idleStep3: "为您制定“强硬”、“法律”或“礼貌”的战术对应话术钢甲。",
    standardActs: "涵盖的标准法律条款",
    civicProtection: "公民权益保障保障",

    consultationTitle: "权益咨询评估报告",
    consultationSub: "基于标准法律框架与租户/雇员权利保障制定。",
    saveToProfile: "保存到个人资料",
    signInToSave: "登录以保存记录",
    riskLevel: "风险等级",
    riskLow: "低风险",
    riskMedium: "中风险",
    riskHigh: "高风险",
    summaryTitle: "战术情境分析总结",
    violationsTitle: "检测到的涉嫌侵权诉求及违法行为",
    violationsEmpty: "本次对话未检测到明显的权利侵害或高压威胁。请继续保持警惕。",
    responseArmorTitle: "量身定制的防御性回应话术",
    rationaleLabel: "战术意图说明",
    copyText: "复制话术",
    copiedText: "已复制！",
    speakText: "语音朗读",
    stopText: "停止朗读",

    closeBtn: "关闭",
    backBtn: "返回",
    submitBtn: "提交"
  },
  vi: {
    brandName: "Trợ Lý Pháp Lý Bỏ Túi",
    brandTagline: "Bảo vệ quyền công dân, người thuê nhà và người lao động trong các tranh chấp trực tiếp.",
    activeAssist: "TRỢ GIÚP HOẠT ĐỘNG",
    howItWorks: "Cách hoạt động",
    counselingSuite: "Phòng Tư Vấn",
    playground: "Mô Phỏng Tranh Chấp",
    aiChat: "Trò Chuyện AI Pháp Lý",
    rightsLibrary: "Thư Viện Luật Pháp",
    rehearsalCoach: "Luyện Giọng Nói",
    letterhead: "Thư Kháng Nghị",
    mockArbitrator: "Tòa Án Giả Định",
    upgradeToPro: "✨ Nâng Cấp Pro",
    dashboard: "Bảng Điều Khiển",
    signInProfile: "Đăng Nhập / Cá Nhân",
    telemetryText: "67% người thuê nhà không biết rõ quyền lợi cơ bản",

    guidedIntake: "Khai Báo Trợ Giúp",
    recordVoice: "Ghi Âm Giọng Nói",
    textCopier: "Sao Chép Văn Bản",
    newConsult: "TƯ VẤN MỚI",
    selectCategory: "Chọn danh mục tranh chấp...",
    opponentPlaceholder: "Tên đối thủ cạnh tranh...",
    opponentLabel: "Tên của Bên Đối Phương (Ví dụ: Chủ nhà, Sếp)",
    analyzeButton: "⚡ Phân Tích Cuộc Gọi",
    analyzingButton: "🔍 Đang Thẩm Định Quyền Lợi...",
    presetTitle: "Mẫu Kịch Bản Tranh Chấp",
    presetDesc: "Kiểm tra Trợ Lý Pháp Lý bằng cách chọn kịch bản có sẵn",

    catLandlord: "Người Thuê vs. Chủ Nhà",
    catEmployer: "Nhân Viên vs. Sếp",
    catInsurance: "Tranh Chấp Bảo Hiểm",
    catGeneral: "Vấn Đề Quyền Lợi Chung",

    idleTitle: "Trợ Lý Pháp Lý Sẵn Sàng Hỗ Trợ",
    idleSubtitle: "Ghi âm trực tiếp, nhập văn bản hoặc hoàn tất khai báo trợ giúp. Trợ Lý Pháp Lý sẽ ngay lập tức:",
    idleStep1: "Ghi lại cuộc đối thoại bằng tiếng Anh hoặc tiếng bản địa.",
    idleStep2: "Kiểm tra các hành vi vi phạm pháp luật theo tiêu chuẩn bảo vệ.",
    idleStep3: "Đề xuất 3 mẫu câu trả lời (Cứng Rắn, Pháp Lý hoặc Lịch Sự) như bộ giáp bảo vệ.",
    standardActs: "Lực Lượng Luật Áp Dụng",
    civicProtection: "Bảo Đảm Quyền Công Dân",

    consultationTitle: "Báo Cáo Thẩm Định Quyền Lợi",
    consultationSub: "Được xây dựng dựa trên các khuôn khổ pháp lý chuẩn mực và bảo vệ người thuê/lao động.",
    saveToProfile: "Lưu vào Hồ Sơ",
    signInToSave: "Đăng Nhập để Lưu",
    riskLevel: "MỨC ĐỘ RỦI RO",
    riskLow: "THẤP",
    riskMedium: "TRUNG BÌNH",
    riskHigh: "CAO",
    summaryTitle: "Tóm Tắt Tình Huống Chiến Thuật",
    violationsTitle: "Các Vi Phạm & Yêu Cầu Đáng Ngờ Được Phát Hiện",
    violationsEmpty: "Không phát hiện vi phạm quyền lợi nghiêm trọng nào trong cuộc đối thoại này. Hãy tiếp tục cảnh giác.",
    responseArmorTitle: "Các Phương Án Đối Phó Chiến Thuật",
    rationaleLabel: "Mục Tiêu Chiến Thuật",
    copyText: "Sao Chép",
    copiedText: "Đã sao chép!",
    speakText: "Nghe Phát Âm",
    stopText: "Dừng Phát Âm",

    closeBtn: "Đóng",
    backBtn: "Quay lại",
    submitBtn: "Gửi đi"
  }
};
