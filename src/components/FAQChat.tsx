import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Loader2, Sparkles, BookOpen, Scale, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : "https://pocket-advocate-backend.onrender.com";

interface FAQChatProps {
  category: "landlord" | "employer" | "insurance" | "general";
  language?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const PRESET_QUESTIONS: Record<string, Record<string, string[]>> = {
  en: {
    landlord: [
      "How long does a landlord have to return my security deposit?",
      "Can my landlord enter my apartment without notice?",
      "What makes an apartment legally 'uninhabitable'?",
      "Can a landlord charge for standard carpet wear and tear?"
    ],
    employer: [
      "Is it illegal to discuss my hourly pay with other workers?",
      "When am I legally entitled to receive overtime pay?",
      "Can my boss reduce my hours if I report a safety violation?",
      "Can an employer force me to work off-the-clock?"
    ],
    insurance: [
      "What can I do if my home insurance claim is ignored?",
      "What counts as bad faith by an insurance claims adjuster?",
      "Can I use my own contractor instead of the insurance quote?",
      "How do I appeal a denied property claim?"
    ],
    general: [
      "What makes a verbal agreement legally binding?",
      "How do I dispute an unfair fee or hidden surcharge?",
      "What elements should be included in a de-escalation notice?"
    ]
  },
  es: {
    landlord: [
      "¿Cuánto tiempo tiene el casero para devolver el depósito de seguridad?",
      "¿Puede mi casero entrar a mi apartamento sin previo aviso?",
      "¿Qué hace que un apartamento sea legalmente 'inhabitable'?",
      "¿Puede un casero cobrar por el desgaste normal de la alfombra?"
    ],
    employer: [
      "¿Es ilegal discutir mi pago por hora con otros trabajadores?",
      "¿Cuándo tengo derecho legal a recibir pago por horas extras?",
      "¿Puede mi jefe reducir mis horas si reporto una violación de seguridad?",
      "¿Puede un empleador obligarme a trabajar fuera de horario?"
    ],
    insurance: [
      "¿Qué puedo hacer si ignoran mi reclamación de seguro de hogar?",
      "¿Qué cuenta como mala fe de un ajustador de seguros?",
      "¿Puedo usar mi propio contratista en lugar del presupuesto del seguro?",
      "¿Cómo apelo una reclamación de propiedad denegada?"
    ],
    general: [
      "¿Qué hace que un acuerdo verbal sea legalmente vinculante?",
      "¿Cómo discuto un cargo injusto o una tarifa oculta?",
      "¿Qué elementos deben incluirse en un aviso de desescalada?"
    ]
  },
  zh: {
    landlord: [
      "房东有多长时间可以退还我的安全押金？",
      "房东可以在没有提前通知的情况下进入我的公寓吗？",
      "是什么让公寓在法律上被认定为'不适宜居住'？",
      "房东可以对地毯的正常磨损收费吗？"
    ],
    employer: [
      "与其他员工讨论我的时薪是违法的吗？",
      "我什么时候在法律上有权获得加班费？",
      "如果我举报安全违规行为，老板能减少我的工作时间吗？",
      "雇主能强迫我无薪加班吗？"
    ],
    insurance: [
      "如果我的房屋保险索赔被忽视了，我该怎么办？",
      "保险理赔员的哪些行为算作恶意欺诈？",
      "我可以使用我自己的承包商，而不是保险公司的报价吗？",
      "如何申诉被拒绝的财产索赔？"
    ],
    general: [
      "是什么使口头协议具有法律约束力？",
      "如何争议不公平的收费或隐藏的附加费？",
      "去升级通知中应该包含哪些要素？"
    ]
  },
  vi: {
    landlord: [
      "Chủ nhà có bao nhiêu ngày để hoàn trả tiền đặt cọc của tôi?",
      "Chủ nhà của tôi có thể tự ý vào căn hộ mà không báo trước không?",
      "Điều gì làm cho một căn hộ bị coi là 'không thể ở được' về mặt pháp lý?",
      "Chủ nhà có được tính phí hao mòn thảm thông thường không?"
    ],
    employer: [
      "Thảo luận về lương theo giờ của tôi với các đồng nghiệp có phạm luật không?",
      "Khi nào tôi được quyền hưởng lương làm thêm giờ theo luật định?",
      "Sếp có thể giảm giờ làm của tôi nếu tôi báo cáo vi phạm an toàn không?",
      "Người sử dụng lao động có thể bắt tôi làm việc không ghi giờ không?"
    ],
    insurance: [
      "Tôi có thể làm gì nếu yêu cầu bồi thường bảo hiểm nhà bị ngó lơ?",
      "Điều gì bị coi là cố ý quỵt nợ bởi đại lý điều chỉnh bảo hiểm?",
      "Tôi có được dùng nhà thầu riêng thay vì bên bảo hiểm chỉ định không?",
      "Làm thế nào để khiếu nại yêu cầu bồi thường tài sản bị từ chối?"
    ],
    general: [
      "Điều gì làm cho một thỏa thuận miệng có hiệu lực pháp lý ràng buộc?",
      "Làm cách nào để tranh chấp một khoản phí bất công hoặc phụ phí ẩn?",
      "Những yếu tố nào nên có trong một thông báo giảm căng thẳng?"
    ]
  }
};

export default function FAQChat({ category, language = "en" }: FAQChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcomeMessages: Record<string, string> = {
      en: "Hello! I am your AI Rights Educator. Feel free to select a quick-lookup topic below or type any general question about your tenant, employee, or policyholder protections.",
      es: "¡Hola! Soy tu Educador de Derechos de IA. No dudes en seleccionar un tema de búsqueda rápida a continuación o escribir cualquier pregunta general sobre tus protecciones como inquilino, empleado o asegurado.",
      zh: "你好！我是您的 AI 权益助手。请随时在下方选择快速查询主题，或输入关于租户、员工或投保人权益保护的任何常见问题。",
      vi: "Xin chào! Tôi là Trợ Lý Giáo Dục Quyền Lợi AI. Đừng ngần ngại chọn một chủ đề tra cứu nhanh bên dưới hoặc nhập câu hỏi chung về quyền người thuê nhà, lao động hay bảo hiểm."
    };
    
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: welcomeMessages[language] || welcomeMessages.en,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  }, [language]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/faq-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: textToSend,
          category,
          language
        })
      });

      const responseText = await response.text();
      let data: any = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error("Server returned an invalid non-JSON response.");
        }
      }

      if (!response.ok) {
        throw new Error(data.error || `Server returned error status ${response.status}`);
      }

      const botMsg: ChatMessage = {
        id: "msg_" + Math.random().toString(36).substr(2, 9),
        sender: "bot",
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: "error_" + Date.now(),
        sender: "bot",
        text: `⚠️ Error: ${e.message || "Failed to communicate with the Rights Educator. Please check network connection."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (text: string) => {
    if (!text) return null;

    const hasSimpleAnswer = text.includes("1. \"The Simple Answer\":") || text.includes("The Simple Answer:");
    const hasUnderLaw = text.includes("2. \"Under the Law\":") || text.includes("Under the Law:");
    const hasAdvice = text.includes("3. \"De-escalation Advice\":") || text.includes("De-escalation Advice:");

    if (hasSimpleAnswer || hasUnderLaw || hasAdvice) {
      return (
        <div className="space-y-3 font-sans text-xs text-slate-200 leading-relaxed">
          {text.split(/\n\n+/).map((block, idx) => {
            if (block.toLowerCase().includes("simple answer")) {
              return (
                <div key={idx} className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                    The Simple Answer
                  </span>
                  {block.replace(/^[0-9.\"\s]+The Simple Answer:\"?/i, "").trim()}
                </div>
              );
            }
            if (block.toLowerCase().includes("under the law")) {
              return (
                <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-850">
                  <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-slate-400" /> Statutory Framework
                  </span>
                  {block.replace(/^[0-9.\"\s]+Under the Law:\"?/i, "").trim()}
                </div>
              );
            }
            if (block.toLowerCase().includes("de-escalation advice") || block.toLowerCase().includes("advice")) {
              return (
                <div key={idx} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="font-mono text-[9px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    De-escalation Action Plan
                  </span>
                  {block.replace(/^[0-9.\"\s]+De-escalation Advice:\"?/i, "").trim()}
                </div>
              );
            }
            return <p key={idx}>{block}</p>;
          })}
        </div>
      );
    }

    return <p className="font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-line">{text}</p>;
  };

  const currentPresets = (PRESET_QUESTIONS[language] || PRESET_QUESTIONS.en)[category] || (PRESET_QUESTIONS[language] || PRESET_QUESTIONS.en).general;

  const inputPlaceholders: Record<string, string> = {
    en: "Type general question (e.g. 'Is a verbal lease termination notice valid?')...",
    es: "Escribe una pregunta (ej. '¿Es válida una notificación de terminación verbal?')...",
    zh: "输入常见问题（例如：'口头租赁终止通知是否有效？'）...",
    vi: "Nhập câu hỏi chung (ví dụ: 'Thông báo chấm dứt hợp đồng miệng có hiệu lực không?')..."
  };
  const placeholderText = inputPlaceholders[language] || inputPlaceholders.en;

  const headers: Record<string, { title: string; subtitle: string }> = {
    en: { title: "Rights Educator Q&A", subtitle: `Ask general statutory rules for ${category} issues` },
    es: { title: "Consultas de Derechos IA", subtitle: `Preguntas de estatutos sobre ${category}` },
    zh: { title: "权益咨询 Q&A", subtitle: `查询关于 ${category} 争议的常规法律条款` },
    vi: { title: "Hỏi Đáp Quyền Lợi AI", subtitle: `Tra cứu các điều luật về ${category}` }
  };
  const headerText = headers[language] || headers.en;

  return (
    <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col h-[400px]">
      <div className="bg-slate-950/80 border-b border-slate-900 px-4 py-3 flex items-center gap-2">
        <div className="p-1 rounded-lg bg-indigo-500/15 border border-indigo-500/20">
          <Bot className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            {headerText.title}
          </h4>
          <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
            {headerText.subtitle}
          </p>
        </div>
        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[290px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
              msg.sender === "user" 
                ? "bg-indigo-600 border-indigo-500 text-white" 
                : "bg-slate-950 border-slate-800 text-slate-400"
            }`}>
              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-indigo-400" />}
            </div>

            <div className={`p-3.5 rounded-2xl text-xs space-y-1 shadow-lg ${
              msg.sender === "user" 
                ? "bg-indigo-600 text-white rounded-tr-none" 
                : "bg-slate-950/60 border border-slate-850 rounded-tl-none"
            }`}>
              {msg.sender === "user" ? (
                <p className="font-sans leading-relaxed">{msg.text}</p>
              ) : (
                renderMessageContent(msg.text)
              )}
              <span className="block text-[8px] text-slate-500 font-mono text-right mt-1.5">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="px-4 py-2 bg-slate-950/30 border-t border-slate-900/60 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {currentPresets.map((preset) => (
          <button
            key={preset}
            onClick={() => handleSendMessage(preset)}
            disabled={loading}
            className="inline-block text-[10px] bg-slate-950 border border-slate-850 hover:border-indigo-500/50 hover:bg-slate-900 text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
          >
            {preset}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-3 bg-slate-950 border-t border-slate-900 flex gap-2 items-center"
      >
        <input
          type="text"
          placeholder={placeholderText}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 text-white rounded-xl transition cursor-pointer flex items-center justify-center border border-transparent disabled:border-slate-800 shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
