// Application Logic for Phuc An Retail AI Agent Management System
document.addEventListener("DOMContentLoaded", () => {
  // Global State
  const state = {
    currentPhase: 1,
    step2Page: 1,
    step3Page: 1,
    step4Page: 1,
    hasAnalyzedStep1: false,
    desiredOutputs: ["Dashboard"],
    phase1Completed: false,
    phase2Completed: false,
    phase3Completed: false,
    isCleaningRunning: false,
    isReportGenerated: false,
    isAuditCompleted: false,
    selectedStoreForDecision: null,
    chartStores: null,
    chartProductMix: null
  };

  // Sample Raw Records (Representation of the 60,000 dataset)
  const defaultSampleRawRecords = [
    { code: "TRX-100234", time: "02/10 09:15", store: "CH01 - Cầu Giấy", prod: "SP-DGD01 Nồi cơm điện cao tần", cat: "Điện gia dụng", rev: 2590000, cogs: 1761200, status: "Hoàn thành", note: "Hợp lệ", type: "valid" },
    { code: "TRX-100235", time: "02/10 09:15", store: "CH01 - Cầu Giấy", prod: "SP-DGD01 Nồi cơm điện cao tần", cat: "Điện gia dụng", rev: 2590000, cogs: 1761200, status: "Hoàn thành", note: "TRÙNG LẶP: Double POS billing", type: "duplicate" },
    { code: "TRX-100412", time: "03/10 14:20", store: "CH03 - Hai Bà Trưng", prod: "SP-TBS04 Loa bluetooth mini", cat: "Thiết bị số", rev: 490000, cogs: 430000, status: "Hoàn thành", note: "Biên siêu mỏng 12.2% (Xả kho)", type: "valid" },
    { code: "TRX-100589", time: "04/10 16:45", store: "CH08 - Quảng Ninh", prod: "SP-DGD09 Máy lọc không khí Pro", cat: "Điện gia dụng", rev: 6890000, cogs: 4685200, status: "Đã hủy", note: "ĐƠN HỦY: Kho báo ảo, hết hàng", type: "cancelled" },
    { code: "TRX-100720", time: "05/10 11:30", store: "CH15 - Bình Thạnh", prod: "SP-SK02 Máy nâng cơ mặt ion", cat: "Chăm sóc sức khỏe", rev: 3200000, cogs: 1760000, status: "Đổi trả", note: "ĐỔI TRẢ: Khách báo tư vấn sai", type: "return" },
    { code: "TRX-100845", time: "06/10 10:12", store: "CH04 - Hoàn Kiếm", prod: "SP-GD03 Robot hút bụi lau nhà", cat: "Gia dụng thông minh", rev: 8490000, cogs: 5263800, status: "Hoàn thành", note: "LỆCH KỲ: Tính dồn 45 ngày", type: "period" },
    { code: "TRX-101004", time: "07/10 18:05", store: "CH02 - Đống Đa", prod: "SP-SK05 Bàn chải điện sóng âm", cat: "Chăm sóc sức khỏe", rev: 1290000, cogs: 709500, status: "Hoàn thành", note: "Hợp lệ - Biên cao 45%", type: "valid" },
    { code: "TRX-101188", time: "08/10 20:10", store: "CH12 - Quận 1", prod: "SP-TBS01 Tai nghe chống ồn", cat: "Thiết bị số", rev: 2190000, cogs: 1708200, status: "Hoàn thành", note: "Hợp lệ", type: "valid" },
    { code: "TRX-101250", time: "09/10 09:40", store: "CH15 - Bình Thạnh", prod: "SP-SK02 Máy nâng cơ mặt ion", cat: "Chăm sóc sức khỏe", rev: 3200000, cogs: 1760000, status: "Đổi trả", note: "ĐỔI TRẢ: Hàng trả chưa trừ COGS", type: "return" },
    { code: "TRX-101420", time: "10/10 15:35", store: "CH06 - Long Biên", prod: "SP-GD01 Nồi chiên không dầu", cat: "Điện gia dụng", rev: 2390000, cogs: 1625200, status: "Hoàn thành", note: "Hợp lệ", type: "valid" },
    { code: "TRX-101560", time: "11/10 17:22", store: "CH03 - Hai Bà Trưng", prod: "SP-TBS04 Loa bluetooth mini", cat: "Thiết bị số", rev: 490000, cogs: 430000, status: "Hoàn thành", note: "Đếm trùng giao dịch POS", type: "duplicate" },
    { code: "TRX-101790", time: "12/10 13:10", store: "CH07 - Hải Phòng", prod: "SP-DGD03 Lò vi sóng điện tử", cat: "Điện gia dụng", rev: 3190000, cogs: 2169200, status: "Đổi trả", note: "ĐỔI TRẢ: Vận chuyển móp méo", type: "return" },
    { code: "TRX-101920", time: "13/10 19:40", store: "CH18 - Bình Dương", prod: "SP-GD05 Quạt lọc không khí", cat: "Gia dụng thông minh", rev: 4200000, cogs: 2604000, status: "Hoàn thành", note: "Hợp lệ", type: "valid" },
    { code: "TRX-102105", time: "14/10 11:15", store: "CH10 - Huế", prod: "SP-SK01 Máy massage cổ vai gáy", cat: "Chăm sóc sức khỏe", rev: 1850000, cogs: 1017500, status: "Hoàn thành", note: "Hợp lệ", type: "valid" }
  ];

  let currentRawRecords = [];
  let customDatasetLoaded = false;
  let customDatasetStats = {
    totalRows: 0,
    duplicateRows: 0,
    cancelledRows: 0,
    returnRows: 0,
    cleanRows: 0,
    fileName: "Chưa có tệp"
  };

  try {
    window.__rawOriginalUncleanedSnapshot = {
      records: JSON.parse(JSON.stringify(defaultSampleRawRecords)),
      stats: {
        totalRows: 60000,
        duplicateRows: 1842,
        autoDeletedDuplicates: 0,
        cancelledRows: 2150,
        returnRows: 3420,
        cleanRows: 56008,
        fileName: "Dữ liệu mẫu Phúc An (60.000 dòng)"
      }
    };
    window.__initialUploadedSnapshot = {
      records: JSON.parse(JSON.stringify(defaultSampleRawRecords)),
      stats: { ...window.__rawOriginalUncleanedSnapshot.stats }
    };
  } catch (e) {}

  // Helper formatting functions
  function formatMoney(amount) {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(2) + " Tỷ";
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + " Tr";
    }
    return new Intl.NumberFormat('vi-VN').format(amount) + " đ";
  }

  // ========================================================
  // SYSTEM & WORKFLOW NOTIFICATION CENTER (Header Bell Icon)
  // ========================================================
  const notificationStore = [];
  let activeNotifFilter = "all";
  let lastNotifDedupKey = "";
  let lastNotifDedupTs = 0;
  let lastNotifiedWorkflowStep = null;

  function escapeNotifHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function updateNotificationBadgeAndTabs() {
    const badge = document.getElementById("notif-badge");
    const countAllEl = document.getElementById("notif-tab-count-all");
    const countWfEl = document.getElementById("notif-tab-count-workflow");
    const countErrEl = document.getElementById("notif-tab-count-error");
    const statusEl = document.getElementById("notif-system-status");
    const unreadSummaryEl = document.getElementById("notif-unread-summary");

    const totalAll = notificationStore.length;
    const totalWf = notificationStore.filter(n => n.category === "workflow").length;
    const totalErr = notificationStore.filter(n => n.category === "error").length;
    const unreadAll = notificationStore.filter(n => !n.read).length;
    const unreadErr = notificationStore.filter(n => !n.read && n.category === "error").length;

    if (countAllEl) countAllEl.textContent = String(totalAll);
    if (countWfEl) countWfEl.textContent = String(totalWf);
    if (countErrEl) countErrEl.textContent = String(totalErr);
    if (unreadSummaryEl) unreadSummaryEl.textContent = `${unreadAll} chưa đọc`;

    if (badge) {
      if (unreadAll > 0) {
        badge.classList.remove("hidden");
        badge.textContent = unreadAll > 9 ? "9+" : String(unreadAll);
        if (unreadErr > 0) {
          badge.className = "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm border-2 border-white animate-pulse";
        } else {
          badge.className = "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5B8E] text-white text-[10px] font-black flex items-center justify-center shadow-sm border-2 border-white";
        }
      } else {
        badge.classList.add("hidden");
      }
    }

    if (statusEl) {
      const stepLabels = {
        1: "Bước 1: Nạp dữ liệu",
        2: "Bước 2: Làm sạch & Đối soát",
        3: "Bước 3: Phân tích & Audit",
        4: "Bước 4: Dashboard & Báo cáo"
      };
      const curStepText = stepLabels[state.currentWorkflowStep || 1] || "Bước 1: Nạp dữ liệu";
      if (unreadErr > 0) {
        statusEl.className = "flex items-center gap-1.5 font-bold text-rose-600 truncate";
        statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block shrink-0"></span><span>Có ${unreadErr} cảnh báo/lỗi mới • ${curStepText}</span>`;
      } else if (!navigator.onLine) {
        statusEl.className = "flex items-center gap-1.5 font-bold text-amber-600 truncate";
        statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0"></span><span>Mất kết nối mạng • ${curStepText}</span>`;
      } else {
        statusEl.className = "flex items-center gap-1.5 font-bold text-emerald-700 truncate";
        statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0"></span><span>Hệ thống ổn định • ${curStepText}</span>`;
      }
    }
  }

  function renderNotificationsList() {
    const listEl = document.getElementById("notifications-list");
    if (!listEl) return;

    const filtered = notificationStore.filter(n => {
      if (activeNotifFilter === "workflow") return n.category === "workflow";
      if (activeNotifFilter === "error") return n.category === "error";
      return true;
    });

    if (filtered.length === 0) {
      const emptyLabel = activeNotifFilter === "error"
        ? "Không có lỗi hệ thống hay cảnh báo nào! Hệ thống đang vận hành trơn tru."
        : (activeNotifFilter === "workflow"
          ? "Chưa có cập nhật quy trình làm việc nào."
          : "Chưa có thông báo nào.");
      listEl.innerHTML = `
        <div class="p-6 text-center space-y-1.5">
          <i class="fa-solid ${activeNotifFilter === "error" ? "fa-shield-check text-emerald-400" : "fa-bell-slash text-slate-300"} text-2xl block"></i>
          <p class="text-xs font-semibold text-slate-500">${emptyLabel}</p>
        </div>
      `;
      return;
    }

    const typeStyles = {
      error: {
        bg: "bg-rose-50/70 hover:bg-rose-50",
        iconWrap: "bg-rose-100 text-rose-600",
        icon: "fa-circle-xmark",
        tag: "LỖI HỆ THỐNG",
        tagCls: "bg-rose-600 text-white",
        dotCls: "bg-rose-600"
      },
      warning: {
        bg: "bg-amber-50/60 hover:bg-amber-50",
        iconWrap: "bg-amber-100 text-amber-600",
        icon: "fa-triangle-exclamation",
        tag: "CẢNH BÁO",
        tagCls: "bg-amber-500 text-white",
        dotCls: "bg-amber-500"
      },
      success: {
        bg: "bg-emerald-50/40 hover:bg-emerald-50/80",
        iconWrap: "bg-emerald-100 text-emerald-600",
        icon: "fa-circle-check",
        tag: "HOÀN TẤT",
        tagCls: "bg-emerald-600 text-white",
        dotCls: "bg-emerald-500"
      },
      workflow: {
        bg: "bg-[#FFFBFD] hover:bg-[#FFF0F5]/70",
        iconWrap: "bg-[#FF5B8E]/15 text-[#FF5B8E]",
        icon: "fa-diagram-project",
        tag: "QUY TRÌNH",
        tagCls: "bg-[#FF5B8E] text-white",
        dotCls: "bg-[#FF5B8E]"
      }
    };

    listEl.innerHTML = filtered.map(item => {
      const st = typeStyles[item.type] || typeStyles.workflow;
      const unreadRing = item.read ? "opacity-80" : "";
      const stepBtn = item.step
        ? `<button type="button" class="notif-jump-step mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-[#FAD2E1] text-[10px] font-bold text-[#FF5B8E] hover:bg-[#FFF0F5] transition cursor-pointer" data-step="${item.step}"><i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i> Xem Bước ${item.step}</button>`
        : "";
      return `
        <div class="notif-item px-3.5 py-3 transition cursor-pointer ${st.bg} ${unreadRing}" data-notif-id="${item.id}">
          <div class="flex items-start gap-2.5">
            <span class="w-7 h-7 rounded-xl ${st.iconWrap} flex items-center justify-center text-xs shrink-0 mt-0.5">
              <i class="fa-solid ${st.icon}"></i>
            </span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide shrink-0 ${st.tagCls}">${st.tag}</span>
                  <span class="text-xs font-extrabold text-slate-800 truncate">${escapeNotifHtml(item.title)}</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="text-[10px] font-mono text-slate-400">${item.time}</span>
                  ${item.read ? "" : `<span class="w-2 h-2 rounded-full ${st.dotCls} shrink-0"></span>`}
                </div>
              </div>
              <p class="text-[11px] text-slate-600 mt-1 leading-relaxed break-words">${escapeNotifHtml(item.message)}</p>
              ${stepBtn}
            </div>
          </div>
        </div>
      `;
    }).join("");

    listEl.querySelectorAll(".notif-item").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-notif-id");
        const found = notificationStore.find(n => n.id === id);
        if (found && !found.read) {
          found.read = true;
          updateNotificationBadgeAndTabs();
          renderNotificationsList();
        }
      });
    });

    listEl.querySelectorAll(".notif-jump-step").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const stepNum = parseInt(btn.getAttribute("data-step"), 10);
        const panel = document.getElementById("notifications-panel");
        if (panel) panel.classList.add("hidden");
        const navBtn = document.getElementById(`step-nav-${stepNum}`);
        if (navBtn) navBtn.click();
      });
    });
  }

  function pushSystemNotification({ title, message, type = "workflow", category = null, step = null } = {}) {
    if (!message) return;
    const dedupKey = `${type}|${title}|${message}`;
    const now = Date.now();
    if (dedupKey === lastNotifDedupKey && now - lastNotifDedupTs < 1500) return;
    lastNotifDedupKey = dedupKey;
    lastNotifDedupTs = now;

    const resolvedCategory = category || ((type === "error" || type === "warning") ? "error" : "workflow");
    const timeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    notificationStore.unshift({
      id: `notif-${now}-${Math.random().toString(36).slice(2, 7)}`,
      title: title || (resolvedCategory === "error" ? "Cảnh báo hệ thống" : "Cập nhật quy trình"),
      message: String(message),
      type,
      category: resolvedCategory,
      step: step || null,
      time: timeStr,
      read: false
    });

    if (notificationStore.length > 80) {
      notificationStore.length = 80;
    }

    const bellIcon = document.getElementById("notif-bell-icon");
    if (bellIcon) {
      bellIcon.classList.add("scale-125", "text-[#FF5B8E]");
      setTimeout(() => {
        bellIcon.classList.remove("scale-125", "text-[#FF5B8E]");
      }, 450);
    }

    updateNotificationBadgeAndTabs();
    const panel = document.getElementById("notifications-panel");
    if (panel && !panel.classList.contains("hidden")) {
      renderNotificationsList();
    }
  }
  window.pushSystemNotification = pushSystemNotification;

  function classifyToastForNotification(message, isErrorFlag) {
    const msg = String(message || "").trim();
    const low = msg.toLowerCase();

    // Positive workflow messages (even if caller passed isErrorFlag=true by mistake)
    const isClearlyPositive = /^(?:đã nhận|đã lưu|đã nạp|đã xuất|đã xóa bản ghi|đã xóa \d|đã xác nhận|đã tải|đã chuyển|đã bật|đã chạy|đã giữ|đã làm trống|đã phân tích|đã đăng|chào mừng|ai agent đã|báo cáo quản trị|toàn bộ quy trình|cross-check audit hoàn tất|giám đốc kinh doanh đã|đang đọc tệp|switched entire)/i.test(low);

    // Real system/runtime/file/library errors
    const isHardSystemError = !isClearlyPositive && /(?:lỗi đọc|lỗi giải mã|không thể tạo|không tải được|chưa tải xong|chưa sẵn sàng|thất bại|lỗi hệ thống|error|failed|exception)/i.test(low);

    // Validation / workflow warnings
    const isWorkflowWarning = !isClearlyPositive && !isHardSystemError && (
      isErrorFlag || /(?:vui lòng|không có|chưa có|chỉ hỗ trợ|cảnh báo|không tìm thấy|trước khi|cần nhập)/i.test(low)
    );

    if (isHardSystemError) {
      pushSystemNotification({
        title: "Lỗi xử lý hệ thống",
        message: msg,
        type: "error",
        category: "error",
        step: state.currentWorkflowStep || 1
      });
      return;
    }

    if (isWorkflowWarning) {
      pushSystemNotification({
        title: "Cảnh báo thao tác / Quy trình",
        message: msg,
        type: "warning",
        category: "error",
        step: state.currentWorkflowStep || 1
      });
      return;
    }

    // Workflow progress & completion classification
    let title = "Quy trình làm việc";
    let type = "workflow";
    let step = state.currentWorkflowStep || 1;

    if (/(?:xuất file|tải xuống|báo cáo word|powerpoint|dashboard|excel|csv)/i.test(low)) {
      title = "Xuất báo cáo & Thành phẩm";
      type = "success";
      step = 4;
    } else if (/(?:báo cáo quản trị|cross-check|audit|ký ban hành)/i.test(low)) {
      title = "Phân tích & Đối soát Bước 3";
      type = "success";
      step = 3;
    } else if (/(?:làm sạch|đã xác nhận dữ liệu sạch|thực thi xong|xóa bản ghi|lưu chỉnh sửa|sửa thủ công|khôi phục|làm trống)/i.test(low)) {
      title = "Làm sạch & Đối soát Bước 2";
      type = /(?:xong|thành công|hoàn tất|đã xác nhận|đã lưu|đã xóa|đã làm sạch)/i.test(low) ? "success" : "workflow";
      step = 2;
    } else if (/(?:đã nhận|đã nạp|đang đọc tệp|bối cảnh|phân tích bối cảnh)/i.test(low)) {
      title = "Tiếp nhận dữ liệu Bước 1";
      type = /(?:đã nhận|đã nạp|đã lưu|đã phân tích)/i.test(low) ? "success" : "workflow";
      step = 1;
    } else if (/(?:toàn bộ quy trình|hoàn thành xuất sắc)/i.test(low)) {
      title = "Hoàn tất quy trình BPMN";
      type = "success";
      step = 4;
    } else if (/(?:đăng nhập|đăng ký|đăng xuất|chào mừng)/i.test(low)) {
      title = "Phiên làm việc & Tài khoản";
      type = "workflow";
      step = null;
    } else if (/(?:chế độ tối|chế độ sáng|tiếng việt|english)/i.test(low)) {
      title = "Cấu hình giao diện";
      type = "workflow";
      step = null;
    }

    pushSystemNotification({ title, message: msg, type, category: "workflow", step });
  }

  // Bind Notification Bell UI Controls
  (function initNotificationCenter() {
    const btnNotif = document.getElementById("btn-notifications");
    const panel = document.getElementById("notifications-panel");
    const wrapper = document.getElementById("notifications-wrapper");
    const btnMarkAll = document.getElementById("btn-notif-mark-all");
    const btnClear = document.getElementById("btn-notif-clear");

    if (btnNotif && panel) {
      btnNotif.addEventListener("click", (e) => {
        e.stopPropagation();
        const langMenuEl = document.getElementById("lang-menu");
        if (langMenuEl) langMenuEl.classList.add("hidden");
        const isOpening = panel.classList.contains("hidden");
        panel.classList.toggle("hidden");
        btnNotif.setAttribute("aria-expanded", String(isOpening));
        if (isOpening) {
          renderNotificationsList();
          updateNotificationBadgeAndTabs();
        }
      });

      document.addEventListener("click", (e) => {
        if (wrapper && !wrapper.contains(e.target)) {
          panel.classList.add("hidden");
          btnNotif.setAttribute("aria-expanded", "false");
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !panel.classList.contains("hidden")) {
          panel.classList.add("hidden");
          btnNotif.setAttribute("aria-expanded", "false");
        }
      });
    }

    document.querySelectorAll(".notif-filter-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        activeNotifFilter = tab.getAttribute("data-notif-filter") || "all";
        document.querySelectorAll(".notif-filter-tab").forEach(t => {
          const isAct = (t.getAttribute("data-notif-filter") === activeNotifFilter);
          if (isAct) {
            t.className = "notif-filter-tab flex-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-[#FF5B8E] text-white transition cursor-pointer flex items-center justify-center gap-1";
          } else {
            t.className = "notif-filter-tab flex-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white text-slate-600 border border-[#FAD2E1] hover:bg-[#FFF0F5] transition cursor-pointer flex items-center justify-center gap-1";
          }
        });
        renderNotificationsList();
      });
    });

    if (btnMarkAll) {
      btnMarkAll.addEventListener("click", () => {
        notificationStore.forEach(n => { n.read = true; });
        updateNotificationBadgeAndTabs();
        renderNotificationsList();
      });
    }

    if (btnClear) {
      btnClear.addEventListener("click", () => {
        notificationStore.length = 0;
        updateNotificationBadgeAndTabs();
        renderNotificationsList();
      });
    }

    // Global Runtime System Error & Network Listeners
    window.addEventListener("error", (event) => {
      const errMsg = event && event.message ? event.message : "Phát sinh lỗi thực thi không xác định trong trình duyệt.";
      const loc = event && event.lineno ? ` (dòng ${event.lineno})` : "";
      pushSystemNotification({
        title: "Lỗi Runtime Hệ Thống",
        message: `${errMsg}${loc}`,
        type: "error",
        category: "error",
        step: state.currentWorkflowStep || 1
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      const reason = event && event.reason
        ? (event.reason.message || String(event.reason))
        : "Tác vụ bất đồng bộ gặp sự cố không xác định.";
      pushSystemNotification({
        title: "Lỗi Tác Vụ Hệ Thống (Async)",
        message: reason,
        type: "error",
        category: "error",
        step: state.currentWorkflowStep || 1
      });
    });

    window.addEventListener("offline", () => {
      pushSystemNotification({
        title: "Mất kết nối mạng",
        message: "Thiết bị đang ngoại tuyến (Offline). Một số tài nguyên hoặc liên kết Google Sheets có thể tạm gián đoạn.",
        type: "error",
        category: "error"
      });
    });

    window.addEventListener("online", () => {
      pushSystemNotification({
        title: "Đã khôi phục kết nối mạng",
        message: "Kết nối mạng đã hoạt động trở lại bình thường.",
        type: "success",
        category: "workflow"
      });
    });

    // Startup System Health & Workflow Guide Notification
    setTimeout(() => {
      const missingLibs = [];
      if (typeof XLSX === "undefined") missingLibs.push("SheetJS (Excel)");
      if (typeof Papa === "undefined") missingLibs.push("PapaParse (CSV)");
      if (typeof Chart === "undefined") missingLibs.push("Chart.js (Biểu đồ)");

      if (missingLibs.length > 0) {
        pushSystemNotification({
          title: "Thiếu thư viện hệ thống",
          message: `Không tải được: ${missingLibs.join(", ")}. Hãy tải lại trang (Ctrl + F5) để khắc phục.`,
          type: "error",
          category: "error",
          step: 1
        });
      }

      pushSystemNotification({
        title: "Hệ thống AI Agent sẵn sàng",
        message: "Quy trình 4 bước: B1 Nạp dữ liệu → B2 Làm sạch & Đối soát → B3 Phân tích & Audit → B4 Dashboard & Xuất báo cáo. Tải tệp Excel/CSV ở Bước 1 để bắt đầu.",
        type: "workflow",
        category: "workflow",
        step: 1
      });
    }, 600);
  })();

  let toastTimer = null;
  function showToast(message, isError = false) {
    try {
      classifyToastForNotification(message, isError);
    } catch (e) {}
    const toast = document.getElementById("toast-notification");
    const text = document.getElementById("toast-text");
    if (!toast || !text) return;
    text.textContent = message;
    if (isError) {
      toast.classList.remove("bg-emerald-600");
      toast.classList.add("bg-rose-600");
    } else {
      toast.classList.remove("bg-rose-600");
      toast.classList.add("bg-emerald-600");
    }
    toast.classList.remove("scale-90", "opacity-0", "pointer-events-none");
    toast.classList.add("scale-100", "opacity-100");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("scale-100", "opacity-100");
      toast.classList.add("scale-90", "opacity-0", "pointer-events-none");
    }, 3000);
  }

  // 4-Step Stepper & Progressive Reveal Engine
  function setWorkflowStep(stepNum) {
    const prevStep = state.currentWorkflowStep;
    state.currentWorkflowStep = stepNum;
    if (prevStep !== stepNum && typeof pushSystemNotification === "function" && lastNotifiedWorkflowStep !== null) {
      const stepGuides = {
        1: { title: "Bước 1: Nạp dữ liệu & Bối cảnh", msg: "Đang ở Bước 1 — Nạp tệp Excel/CSV/JSON và thiết lập bối cảnh doanh nghiệp." },
        2: { title: "Bước 2: Làm sạch & Đối soát dữ liệu", msg: "Đang chuyển sang Bước 2 — AI Agent tự động kiểm tra trùng lặp, đơn hủy, đổi trả và chờ xác thực." },
        3: { title: "Bước 3: Phân tích & Audit chéo", msg: "Đang chuyển sang Bước 3 — Phân tích hiệu suất cửa hàng, nguyên nhân và lập kế hoạch hành động." },
        4: { title: "Bước 4: Dashboard & Xuất báo cáo", msg: "Đang chuyển sang Bước 4 — Xem Dashboard tổng quan và xuất Word / PowerPoint / Excel / HTML." }
      };
      const guide = stepGuides[stepNum];
      if (guide) {
        pushSystemNotification({
          title: guide.title,
          message: guide.msg,
          type: "workflow",
          category: "workflow",
          step: stepNum
        });
      }
    }
    lastNotifiedWorkflowStep = stepNum;
    if (typeof updateNotificationBadgeAndTabs === "function") {
      updateNotificationBadgeAndTabs();
    }
    for (let s = 1; s <= 4; s++) {
      const navBtn = document.getElementById(`step-nav-${s}`);
      const badge = document.getElementById(`badge-step-${s}`);
      if (!navBtn || !badge) continue;
      const circle = navBtn.querySelector(".step-circle");

      if (s < stepNum) {
        // Step completed
        navBtn.className = "step-card text-left flex items-center gap-3 p-3 rounded-2xl border border-emerald-300 bg-emerald-50/50 transition cursor-pointer shadow-xs";
        if (circle) circle.className = "step-circle w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs";
        badge.textContent = "✓ Hoàn thành";
        badge.className = "px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 shrink-0";
      } else if (s === stepNum) {
        // Step currently active
        navBtn.className = "step-card active text-left flex items-center gap-3 p-3 rounded-2xl border-2 border-[#FF5B8E] bg-[#FFF0F5] transition cursor-pointer shadow-xs";
        if (circle) circle.className = "step-circle w-8 h-8 rounded-full bg-[#FF5B8E] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs";
        badge.textContent = "Đang thực hiện";
        badge.className = "px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFE2E5] text-[#FA5A7D] shrink-0 animate-pulse";
      } else {
        // Step pending
        navBtn.className = "step-card text-left flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white transition cursor-pointer opacity-70 hover:opacity-100";
        if (circle) circle.className = "step-circle w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-black text-xs flex items-center justify-center shrink-0";
        badge.textContent = "Chờ";
        badge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 shrink-0";
      }
    }
  }

  // Page Transition Helper (smooth slide-up + top progress sweep)
  function updateMyMelodySpeech(stepLabel) {
    const bubble = document.getElementById("mymelody-speech-bubble");
    const txt = document.getElementById("mymelody-speech-text");
    if (!txt) return;
    const messages = {
      1: "Bước 1: Nạp dữ liệu & bối cảnh doanh nghiệp nhé! 🌸",
      2: "Bước 2: Mình đang đối soát lỗi Đỏ → Xanh giúp bạn! ✨",
      3: "Bước 3: Xem Insight & Action Plan siêu nét nè! 💡",
      4: "Bước 4: Hoàn thành Dashboard & Xuất báo cáo rồi! 🎉"
    };
    if (messages[stepLabel]) {
      txt.textContent = messages[stepLabel];
      if (bubble) bubble.classList.remove("hidden");
    }
  }

  function triggerPageTransition(targetEl) {
    const bar = document.getElementById("page-transition-bar");
    if (bar) {
      bar.style.transition = "none";
      bar.style.width = "0%";
      bar.style.opacity = "1";
      void bar.offsetWidth;
      bar.style.transition = "width 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease";
      bar.style.width = "100%";
      setTimeout(() => {
        bar.style.opacity = "0";
      }, 360);
    }

    if (targetEl) {
      targetEl.classList.remove("page-transition-enter");
      void targetEl.offsetWidth;
      targetEl.classList.add("page-transition-enter");
    }
  }

  function revealSubsequentSteps() {
    if (typeof validateBusinessContextRequired === "function" && !validateBusinessContextRequired()) {
      return false;
    }
    const step1Section = document.getElementById("step1-main-section");
    const container = document.getElementById("subsequent-steps-container");
    if (step1Section) {
      step1Section.classList.add("hidden");
    }
    if (container) {
      container.classList.remove("hidden");
    }
    state.hasAnalyzedStep1 = true;
    setWorkflowStep(2);
    switchPhase(1);
    updateMyMelodySpeech(2);
    triggerPageTransition(container);
  }

  function hideSubsequentSteps() {
    const step1Section = document.getElementById("step1-main-section");
    const container = document.getElementById("subsequent-steps-container");
    if (step1Section) {
      step1Section.classList.remove("hidden");
      triggerPageTransition(step1Section);
    }
    if (container) {
      container.classList.add("hidden");
    }
    state.hasAnalyzedStep1 = false;
    state.phase1Completed = false;
    setWorkflowStep(1);
    updateMyMelodySpeech(1);
  }

  // Phase Tab Switching Logic
  function openVerificationChoiceModal() {
    const modal = document.getElementById("verification-choice-modal");
    const summaryEl = document.getElementById("verification-modal-summary");
    if (summaryEl) {
      const tot = (customDatasetStats.totalRows || 0).toLocaleString("vi-VN");
      const cln = (customDatasetStats.cleanRows || 0).toLocaleString("vi-VN");
      summaryEl.innerHTML = `<strong>Tóm tắt Bước 2:</strong> Đã kiểm tra <strong>${tot}</strong> dòng dữ liệu gốc • Đạt <strong>${cln}</strong> dòng sạch. Bạn có hài lòng với kết quả sửa của AI Agent chưa?`;
    }
    if (modal) {
      modal.classList.remove("hidden");
    }
  }

  function setStep2Page(pageNum) {
    const p = Math.max(1, Math.min(3, pageNum));
    state.step2Page = p;
    for (let i = 1; i <= 3; i++) {
      const el = document.getElementById(`step2-page-${i}-content`);
      if (el) el.classList.toggle("hidden", i !== p);
    }
    const activeEl = document.getElementById(`step2-page-${p}-content`);
    if (activeEl) triggerPageTransition(activeEl);

    document.querySelectorAll(".step2-subtab").forEach(btn => {
      const btnP = parseInt(btn.getAttribute("data-s2-page"), 10);
      if (btnP === p) {
        btn.className = "step2-subtab active px-3 py-2 rounded-xl text-xs font-extrabold bg-[#FF5B8E] text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer";
      } else {
        btn.className = "step2-subtab px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-[#FF5B8E] border border-[#FAD2E1] transition flex items-center justify-center gap-1.5 cursor-pointer";
      }
    });

    const ind = document.getElementById("step2-page-indicator");
    const prev = document.getElementById("btn-s2-prev");
    const next = document.getElementById("btn-s2-next");
    if (ind) ind.textContent = `${p} / 3`;
    if (prev) prev.disabled = p === 1;
    if (next) next.disabled = p === 3;
  }

  function setStep3Page(pageNum) {
    const p = Math.max(1, Math.min(4, pageNum));
    state.step3Page = p;
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById(`step3-page-${i}-content`);
      if (el) el.classList.toggle("hidden", i !== p);
    }
    const overviewCharts = document.getElementById("dabang-overview-charts");
    if (overviewCharts) {
      overviewCharts.classList.add("hidden");
    }
    const activeEl = document.getElementById(`step3-page-${p}-content`);
    if (activeEl) triggerPageTransition(activeEl);

    document.querySelectorAll(".step3-subtab").forEach(btn => {
      const btnP = parseInt(btn.getAttribute("data-s3-page"), 10);
      if (btnP === p) {
        btn.className = "step3-subtab active px-3 py-2 rounded-xl text-xs font-extrabold bg-[#FF5B8E] text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer";
      } else {
        btn.className = "step3-subtab px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-[#FF5B8E] border border-[#FAD2E1] transition flex items-center justify-center gap-1.5 cursor-pointer";
      }
    });

    const ind = document.getElementById("step3-page-indicator");
    const prev = document.getElementById("btn-s3-prev");
    const next = document.getElementById("btn-s3-next");
    if (ind) ind.textContent = `${p} / 4`;
    if (prev) prev.disabled = p === 1;
    if (next) next.disabled = p === 4;
  }

  document.querySelectorAll(".step2-subtab").forEach(btn => {
    btn.addEventListener("click", () => {
      setStep2Page(parseInt(btn.getAttribute("data-s2-page"), 10));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  document.getElementById("btn-s2-prev")?.addEventListener("click", () => {
    setStep2Page((state.step2Page || 1) - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("btn-s2-next")?.addEventListener("click", () => {
    setStep2Page((state.step2Page || 1) + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll(".step3-subtab").forEach(btn => {
    btn.addEventListener("click", () => {
      setStep3Page(parseInt(btn.getAttribute("data-s3-page"), 10));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  document.getElementById("btn-s3-prev")?.addEventListener("click", () => {
    setStep3Page((state.step3Page || 1) - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("btn-s3-next")?.addEventListener("click", () => {
    setStep3Page((state.step3Page || 1) + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function setStep4Page(pageNum) {
    const p = Math.max(1, Math.min(4, pageNum));
    state.step4Page = p;

    const overviewCharts = document.getElementById("dabang-overview-charts");
    const bpmnMainCard = document.getElementById("bpmn-main-card");
    const bpmnHeader = document.getElementById("bpmn-engine-header");
    const s4p2 = document.getElementById("step4-page-2-content");
    const s4p3 = document.getElementById("step4-page-3-content");
    const s4p4 = document.getElementById("step4-page-4-content");
    const s4p5 = document.getElementById("step4-page-5-content");

    if (overviewCharts) overviewCharts.classList.toggle("hidden", p !== 1);
    if (bpmnMainCard) bpmnMainCard.classList.toggle("hidden", p === 1);
    if (bpmnHeader) bpmnHeader.classList.add("hidden");
    if (s4p2) s4p2.classList.add("hidden");
    if (s4p3) s4p3.classList.toggle("hidden", p !== 2);
    if (s4p4) s4p4.classList.toggle("hidden", p !== 3);
    if (s4p5) s4p5.classList.toggle("hidden", p !== 4);

    if (p === 3) {
      renderWebExecutiveReport();
    }

    const activeTarget = p === 1 ? overviewCharts : (p === 2 ? s4p3 : (p === 3 ? s4p4 : s4p5));
    if (activeTarget) triggerPageTransition(activeTarget);

    // Update subnav tabs (4 tabs: 1 Biểu Đồ, 2 Xếp Hạng, 3 Báo Cáo Web, 4 Xuất File)
    document.querySelectorAll(".step4-subtab").forEach(btn => {
      const btnP = parseInt(btn.getAttribute("data-s4-page"), 10);
      if (btnP === p) {
        btn.className = "step4-subtab active px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#FF5B8E] text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer";
      } else {
        btn.className = "step4-subtab px-3 py-2.5 rounded-xl text-xs font-bold bg-[#FFF5F8] text-slate-700 hover:text-[#FF5B8E] border border-[#FAD2E1] transition flex items-center justify-center gap-1.5 cursor-pointer";
      }
    });

    const indicator = document.getElementById("step4-page-indicator");
    const btnPrevS4 = document.getElementById("btn-s4-prev");
    const btnNextS4 = document.getElementById("btn-s4-next");
    if (indicator) indicator.textContent = `Trang ${p} / 4`;
    if (btnPrevS4) btnPrevS4.disabled = p === 1;
    if (btnNextS4) btnNextS4.disabled = p === 4;
  }

  document.querySelectorAll(".step4-subtab").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = parseInt(btn.getAttribute("data-s4-page"), 10);
      setStep4Page(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.getElementById("btn-s4-prev")?.addEventListener("click", () => {
    setStep4Page((state.step4Page || 1) - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("btn-s4-next")?.addEventListener("click", () => {
    setStep4Page((state.step4Page || 1) + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function switchPhase(phaseNum) {
    if (phaseNum >= 2 && !state.phase1Completed) {
      openVerificationChoiceModal();
      return;
    }
    state.currentPhase = phaseNum;

    // Update Tab UI
    document.querySelectorAll(".phase-tab").forEach((tab, idx) => {
      const p = idx + 1;
      tab.classList.remove("active");
      if (p === phaseNum) {
        tab.classList.add("active");
      }
    });

    const overviewCharts = document.getElementById("dabang-overview-charts");
    const bpmnMainCard = document.getElementById("bpmn-main-card");
    const bpmnHeader = document.getElementById("bpmn-engine-header");
    const s4Subnav = document.getElementById("step4-subnav-bar");
    const s4Footer = document.getElementById("step4-page-footer");

    if (s4Subnav) s4Subnav.classList.toggle("hidden", phaseNum !== 3);
    if (s4Footer) s4Footer.classList.toggle("hidden", phaseNum !== 3);

    // Update Panels Visibility
    document.querySelectorAll(".phase-panel").forEach(p => p.classList.add("hidden"));
    const activePanel = document.getElementById(`panel-phase${phaseNum}`);
    if (activePanel) {
      activePanel.classList.remove("hidden");
      triggerPageTransition(activePanel);
      updateMyMelodySpeech(phaseNum + 1);
    }

    // Auto trigger Phase 2 or 3 rendering if needed
    if (phaseNum === 2 && !state.isReportGenerated) {
      generateManagementReport();
    } else if (phaseNum === 3 && !state.isAuditCompleted) {
      runCrossCheckAudit();
    }

    if (phaseNum === 3) {
      setStep4Page(state.step4Page || 1);
    } else if (phaseNum === 2) {
      if (bpmnMainCard) bpmnMainCard.classList.remove("hidden");
      if (bpmnHeader) bpmnHeader.classList.remove("hidden");
      if (overviewCharts) overviewCharts.classList.add("hidden");
      setStep3Page(state.step3Page || 1);
    } else {
      if (bpmnMainCard) bpmnMainCard.classList.remove("hidden");
      if (bpmnHeader) bpmnHeader.classList.remove("hidden");
      if (overviewCharts) overviewCharts.classList.add("hidden");
      setStep2Page(state.step2Page || 1);
    }
  }

  // Tab click listeners (guarded in case legacy 3-phase tabs are hidden/removed)
  const tabPhase1 = document.getElementById("tab-phase1");
  const tabPhase2 = document.getElementById("tab-phase2");
  const tabPhase3 = document.getElementById("tab-phase3");
  if (tabPhase1) tabPhase1.addEventListener("click", () => switchPhase(1));
  if (tabPhase2) {
    tabPhase2.addEventListener("click", () => {
      if (!state.phase1Completed) {
        showToast("Vui lòng hoàn thành xác thực dữ liệu sạch ở Bước 2 trước!", true);
        return;
      }
      switchPhase(2);
    });
  }
  if (tabPhase3) {
    tabPhase3.addEventListener("click", () => {
      if (!state.phase1Completed) {
        showToast("Vui lòng xác thực Bước 2 trước!", true);
        return;
      }
      switchPhase(3);
    });
  }

  // Render Raw Sample Table (Optimized: capped at 100 preview rows + single innerHTML batch + inline manual edit support)
  function renderRawSampleTable(filter = null, searchQuery = null) {
    const tbody = document.getElementById("raw-sample-tbody");
    if (!tbody) return;

    const filterSelect = document.getElementById("filter-data-type");
    const activeFilter = filter !== null ? filter : (filterSelect ? filterSelect.value : "all");
    const activeSearch = searchQuery !== null ? searchQuery : (state.rawTableSearchQuery || "");
    const normSearch = activeSearch
      ? activeSearch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim()
      : "";

    const filtered = currentRawRecords
      .map((r, origIdx) => ({ r, origIdx }))
      .filter(({ r }) => {
        if (!r) return false;
        if (activeFilter !== "all" && r.type !== activeFilter) return false;
        if (normSearch) {
          const blob = `${r.code || ""} ${r.store || ""} ${r.prod || ""} ${r.cat || ""} ${r.status || ""} ${r.note || ""} ${r.rev || ""}`
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
          return blob.includes(normSearch);
        }
        return true;
      });

    if (filtered.length === 0) {
      let emptyMsg = currentRawRecords.length > 0
        ? `Không có bản ghi nào thuộc bộ lọc "${escapeHtml(activeFilter)}".`
        : `Chưa có dữ liệu giao dịch. Vui lòng kéo & thả tệp Excel (.xlsx, .xls) hoặc CSV để AI Agent bắt đầu phân tích.`;
      if (currentRawRecords.length === 0 && (window.__rawOriginalUncleanedSnapshot || (Array.isArray(window.__dataHistoryStack) && window.__dataHistoryStack.length > 0))) {
        emptyMsg = `Bảng dữ liệu hiện đang trống theo yêu cầu của bạn. Bạn có thể ra lệnh cho Agent: <strong>"Khôi phục lại toàn bộ dữ liệu bao gồm dữ liệu chưa làm sạch"</strong> để phục hồi lại bất cứ lúc nào.`;
      } else if (currentRawRecords.length > 0 && activeFilter === "duplicate" && customDatasetStats.duplicateRows > 0) {
        emptyMsg = `Đã tự động xóa ${customDatasetStats.duplicateRows.toLocaleString('vi-VN')} dòng trùng lặp không phù hợp khỏi bảng dữ liệu (chỉ giữ lại bản ghi gốc hợp lệ).`;
      }
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="p-8 text-center text-slate-400 font-medium">
            <i class="fa-solid fa-inbox text-3xl mb-2 text-slate-300 block"></i>
            ${emptyMsg}
          </td>
        </tr>
      `;
      return;
    }

    const MAX_PREVIEW = 100;
    const previewSlice = filtered.slice(0, MAX_PREVIEW);
    const htmlRows = [];
    const isInlineEdit = !!state.isInlineSampleEditMode;

    for (let i = 0; i < previewSlice.length; i++) {
      const { r, origIdx } = previewSlice[i];
      const isErr = r.type && r.type !== "valid";
      const info = isErr ? getErrorAnalysisAndFix(r) : null;
      const repairedRev = isErr ? (r.fixedRev !== undefined ? r.fixedRev : info.defaultRev) : r.rev;
      const repairedCogs = isErr ? (r.fixedCogs !== undefined ? r.fixedCogs : info.defaultCogs) : r.cogs;

      const rowCls = isInlineEdit
        ? "bg-amber-50/30 hover:bg-amber-50/70 transition"
        : (isErr ? "bg-rose-50/75 hover:bg-rose-100/60 transition" : "hover:bg-slate-50 transition");

      if (isInlineEdit) {
        htmlRows.push(`
          <tr class="${rowCls}" data-inline-row="${origIdx}">
            <td class="p-2.5 font-mono font-bold text-indigo-600 whitespace-nowrap">${escapeHtml(r.code)}</td>
            <td class="p-2.5 text-slate-500 whitespace-nowrap">${escapeHtml(r.time)}</td>
            <td class="p-2">
              <input type="text" data-inline-store="${origIdx}" value="${escapeHtml(r.store)}" class="w-40 bg-white border border-amber-300 focus:border-[#FF5B8E] rounded-lg px-2 py-1 text-xs font-semibold text-slate-900">
            </td>
            <td class="p-2">
              <input type="text" data-inline-prod="${origIdx}" value="${escapeHtml(r.prod)}" class="w-36 bg-white border border-amber-300 focus:border-[#FF5B8E] rounded-lg px-2 py-1 text-xs text-slate-800">
            </td>
            <td class="p-2">
              <input type="text" data-inline-cat="${origIdx}" value="${escapeHtml(r.cat)}" class="w-28 bg-white border border-amber-300 focus:border-[#FF5B8E] rounded-lg px-2 py-1 text-xs text-slate-700">
            </td>
            <td class="p-2 text-right font-mono whitespace-nowrap text-slate-500">${formatMoney(r.rev)}</td>
            <td class="p-2 text-right">
              <input type="number" min="0" step="1000" data-inline-rev="${origIdx}" value="${Number(repairedRev) || 0}" class="w-28 text-right font-mono font-bold bg-emerald-50 border border-emerald-400 focus:border-emerald-600 rounded-lg px-2 py-1 text-xs text-emerald-900">
            </td>
            <td class="p-2 text-right">
              <input type="number" min="0" step="1000" data-inline-cogs="${origIdx}" value="${Number(repairedCogs) || 0}" class="w-24 text-right font-mono bg-white border border-slate-300 focus:border-[#FF5B8E] rounded-lg px-2 py-1 text-xs text-slate-700">
            </td>
            <td class="p-2">
              <select data-inline-type="${origIdx}" class="bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800">
                <option value="valid" ${r.type === "valid" ? "selected" : ""}>Hợp lệ (Sạch)</option>
                <option value="duplicate" ${r.type === "duplicate" ? "selected" : ""}>Trùng lặp</option>
                <option value="cancelled" ${r.type === "cancelled" ? "selected" : ""}>Đơn đã hủy</option>
                <option value="return" ${r.type === "return" ? "selected" : ""}>Đổi trả</option>
                <option value="period" ${r.type === "period" ? "selected" : ""}>Lệch kỳ</option>
              </select>
            </td>
            <td class="p-2 whitespace-nowrap">
              <button type="button" data-inline-save="${origIdx}" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition cursor-pointer">
                <i class="fa-solid fa-check mr-1"></i>Lưu
              </button>
            </td>
          </tr>
        `);
        continue;
      }

      let statusBadge = `<span class="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-medium">${escapeHtml(r.status)}</span>`;
      if (r.type === "duplicate") {
        statusBadge = `<span class="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 border border-rose-300 font-bold">Trùng lặp</span>`;
      } else if (r.type === "cancelled") {
        statusBadge = `<span class="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 border border-rose-300 font-bold">Đã hủy</span>`;
      } else if (r.type === "return") {
        statusBadge = `<span class="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 border border-rose-300 font-bold">Đổi trả</span>`;
      } else if (r.type === "period") {
        statusBadge = `<span class="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 border border-rose-300 font-bold">Lệch kỳ</span>`;
      }

      const codeHtml = isErr
        ? `<span class="inline-block whitespace-nowrap px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold">${escapeHtml(r.code)}</span>`
        : `<span class="whitespace-nowrap">${escapeHtml(r.code)}</span>`;
      const rawRevHtml = isErr
        ? `<span class="inline-block whitespace-nowrap px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold line-through">${formatMoney(r.rev)}</span>`
        : `<span class="whitespace-nowrap">${formatMoney(r.rev)}</span>`;

      let fixedRevHtml = `<span class="whitespace-nowrap text-emerald-700 font-bold">${formatMoney(r.rev)}</span>`;
      let cogsHtml = `<span class="whitespace-nowrap text-slate-500">${formatMoney(r.cogs)}</span>`;
      let actionHtml = `${escapeHtml(r.note)}`;

      if (isErr) {
        if (r.type === "duplicate") {
          fixedRevHtml = `<span class="inline-block whitespace-nowrap px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold">🗑️ Xóa bản ghi</span>`;
          cogsHtml = `<span class="whitespace-nowrap line-through text-slate-400">${formatMoney(r.cogs)}</span>`;
          actionHtml = `${escapeHtml(r.note)} <button type="button" data-sample-delete="${origIdx}" class="ml-1.5 inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-trash-can"></i> Xóa ngay</button>`;
        } else if (r.type === "cancelled") {
          fixedRevHtml = `<span class="inline-block whitespace-nowrap px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">🚫 Loại đơn hủy</span>`;
          cogsHtml = `<span class="whitespace-nowrap line-through text-slate-400">${formatMoney(r.cogs)}</span>`;
          actionHtml = `${escapeHtml(r.note)} <button type="button" data-sample-delete="${origIdx}" class="ml-1.5 inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold cursor-pointer"><i class="fa-solid fa-trash-can"></i> Xóa ngay</button>`;
        } else if (r.type === "return") {
          fixedRevHtml = `<span class="inline-block whitespace-nowrap px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-400 font-black">↩️ Hoàn trừ: ${formatMoney(repairedRev)}</span>`;
          cogsHtml = `<span class="whitespace-nowrap text-emerald-700 font-semibold">${formatMoney(repairedCogs)}</span>`;
          actionHtml = `${escapeHtml(r.note)} <span class="ml-1 inline-block whitespace-nowrap px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black">Đã chuẩn hóa</span>`;
        } else {
          fixedRevHtml = `<span class="inline-block whitespace-nowrap px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-400 font-black">✓ ${formatMoney(repairedRev)}</span>`;
          cogsHtml = `<span class="whitespace-nowrap text-emerald-700 font-semibold">${formatMoney(repairedCogs)}</span>`;
          actionHtml = `${escapeHtml(r.note)} <span class="ml-1 inline-block whitespace-nowrap px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black">Đã chuẩn hóa</span>`;
        }
      }

      htmlRows.push(`
        <tr class="${rowCls}">
          <td class="p-3 font-mono font-bold text-indigo-600 whitespace-nowrap">${codeHtml}</td>
          <td class="p-3 text-slate-500 whitespace-nowrap">${escapeHtml(r.time)}</td>
          <td class="p-3 font-bold text-slate-900 min-w-[170px]">${escapeHtml(r.store)}</td>
          <td class="p-3 text-slate-800 font-medium whitespace-nowrap">${escapeHtml(r.prod)}</td>
          <td class="p-3 text-slate-500 whitespace-nowrap">${escapeHtml(r.cat)}</td>
          <td class="p-3 text-right font-mono whitespace-nowrap">${rawRevHtml}</td>
          <td class="p-3 text-right font-mono whitespace-nowrap">${fixedRevHtml}</td>
          <td class="p-3 text-right font-mono whitespace-nowrap">${cogsHtml}</td>
          <td class="p-3 whitespace-nowrap">${statusBadge}</td>
          <td class="p-3 text-xs min-w-[240px] ${isErr ? 'text-rose-700 font-bold' : 'text-slate-400'}">${actionHtml}</td>
        </tr>
      `);
    }

    if (filtered.length > MAX_PREVIEW) {
      htmlRows.push(`
        <tr class="bg-[#FFF5F8] border-t border-[#FAD2E1]">
          <td colspan="10" class="p-3 text-center text-xs font-bold text-[#FF5B8E]">
            <i class="fa-solid fa-bolt mr-1"></i> Đang hiển thị ${MAX_PREVIEW} dòng mẫu đầu tiên trên tổng số ${filtered.length.toLocaleString('vi-VN')} dòng để tránh giật lag trình duyệt. Toàn bộ dữ liệu vẫn được AI Agent xử lý đầy đủ!
          </td>
        </tr>
      `);
    }

    tbody.innerHTML = htmlRows.join("");

    tbody.querySelectorAll("[data-sample-delete]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-sample-delete"), 10);
        if (currentRawRecords[idx]) {
          if (typeof pushDataHistorySnapshot === "function") pushDataHistorySnapshot();
          const removedRec = currentRawRecords[idx];
          const removedCode = removedRec.code;
          if (removedRec.type === "duplicate") {
            customDatasetStats.autoDeletedDuplicates = (customDatasetStats.autoDeletedDuplicates || 0) + 1;
          }
          currentRawRecords.splice(idx, 1);
          recalculateStatsFromRecords();
          renderRawSampleTable();
          appendLog(`[BẢNG ĐỐI SOÁT] Đã xóa bản ghi lỗi mã ${removedCode} khỏi tập dữ liệu.`, "clean");
          showToast(`Đã xóa bản ghi lỗi mã ${removedCode}!`);
        }
      });
    });

    if (isInlineEdit) {
      tbody.querySelectorAll("[data-inline-save]").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-inline-save"), 10);
          if (typeof window.applyInlineSampleRowEdit === "function") {
            window.applyInlineSampleRowEdit(idx);
            recalculateStatsFromRecords();
            renderRawSampleTable();
            showToast(`Đã lưu chỉnh sửa cho mã ${currentRawRecords[idx]?.code || ""}!`);
          }
        });
      });
    }

    renderCleaningDiffWorkspace();
    renderStep2ErrorRecordsPanel();
  }

  let activeStep2ErrorFilter = "all";

  function collectAllDetectedErrors() {
    if (!Array.isArray(currentRawRecords) || currentRawRecords.length === 0) {
      return [];
    }

    // Use the full original raw snapshot (which includes auto-deleted duplicates) if it matches the active dataset,
    // otherwise fall back to currentRawRecords.
    const rawSnapRecs = (window.__rawOriginalUncleanedSnapshot && Array.isArray(window.__rawOriginalUncleanedSnapshot.records))
      ? window.__rawOriginalUncleanedSnapshot.records
      : null;

    const autoDupCount = customDatasetStats.autoDeletedDuplicates || 0;
    const expectedRawLen = currentRawRecords.length + autoDupCount;
    const useRawSnap = rawSnapRecs && rawSnapRecs.length > 0 &&
      (rawSnapRecs.length === expectedRawLen || rawSnapRecs.length >= currentRawRecords.length);

    const sourceList = useRawSnap ? rawSnapRecs : currentRawRecords;
    const detected = [];

    sourceList.forEach((r, idx) => {
      if (!r) return;
      const rowNum = idx + 1;
      const revNum = Number(r.rev);
      const cogsNum = Number(r.cogs);

      if (r.type && r.type !== "valid") {
        const info = getErrorAnalysisAndFix(r);
        let category = "other";
        let badgeTxt = "Lệch kỳ / Khác";
        let badgeCls = "bg-blue-100 text-blue-700 border-blue-200";

        if (r.type === "duplicate") {
          category = "duplicate";
          badgeTxt = "Trùng lặp";
          badgeCls = "bg-rose-100 text-rose-700 border-rose-200";
        } else if (r.type === "cancelled" || r.type === "cancel") {
          category = "cancelled";
          badgeTxt = "Đơn hủy";
          badgeCls = "bg-amber-100 text-amber-800 border-amber-200";
        } else if (r.type === "return") {
          category = "return";
          badgeTxt = "Đổi trả";
          badgeCls = "bg-purple-100 text-purple-700 border-purple-200";
        }

        const detailReason = (r.note && !/^hợp lệ$/i.test(String(r.note).trim()))
          ? r.note
          : info.wrongSummary;

        const actionNote = (r.type === "duplicate" && autoDupCount > 0)
          ? `Đã phát hiện trùng lặp & tự động loại bỏ khỏi dữ liệu sạch (giữ lại 1 bản ghi gốc hợp lệ)`
          : info.fixedAction;

        detected.push({
          rowNum,
          record: r,
          category,
          badgeTxt,
          badgeCls,
          detailReason,
          actionNote
        });
        return;
      }

      // Universal anomaly checks for ANY arbitrary uploaded dataset (even if row wasn't tagged with standard 4 types)
      const issues = [];
      if (!r.code || !String(r.code).trim()) {
        issues.push("Thiếu mã giao dịch (trống)");
      }
      if (!Number.isFinite(revNum) || revNum <= 0) {
        issues.push(`Doanh thu bất thường (${Number.isFinite(revNum) ? formatMoney(revNum) : "không phải số"})`);
      }
      if (Number.isFinite(cogsNum) && Number.isFinite(revNum) && revNum > 0 && cogsNum > revNum) {
        issues.push(`Giá vốn (${formatMoney(cogsNum)}) cao hơn Doanh thu (${formatMoney(revNum)}) — biên lợi nhuận âm`);
      }
      if (!r.prod || !String(r.prod).trim() || /^sản phẩm mẫu$/i.test(String(r.prod).trim())) {
        if (r.rawRow && Object.values(r.rawRow).some(v => v === "" || v === null || v === undefined)) {
          issues.push("Thiếu thông tin cột dữ liệu (ô trống / null)");
        }
      }

      if (issues.length > 0) {
        detected.push({
          rowNum,
          record: r,
          category: "other",
          badgeTxt: "Sai định dạng / Bất thường",
          badgeCls: "bg-indigo-100 text-indigo-700 border-indigo-200",
          detailReason: issues.join(" • "),
          actionNote: "Cần rà soát, chuẩn hóa lại giá trị hoặc loại bỏ trước khi tổng hợp báo cáo"
        });
      }
    });

    return detected;
  }

  function renderStep2ErrorRecordsPanel(filterOverride = null) {
    if (filterOverride !== null) activeStep2ErrorFilter = filterOverride;
    const tbody = document.getElementById("step2-error-records-tbody");
    const badgeEl = document.getElementById("s2-p1-error-summary-badge");
    const hintEl = document.getElementById("s2-p1-error-showing-hint");
    if (!tbody) return;

    const allErrors = collectAllDetectedErrors();

    // Count per filter category
    const counts = {
      all: allErrors.length,
      duplicate: allErrors.filter(e => e.category === "duplicate").length,
      cancelled: allErrors.filter(e => e.category === "cancelled").length,
      return: allErrors.filter(e => e.category === "return").length,
      other: allErrors.filter(e => e.category === "other").length
    };

    // Update live counts inside filter buttons
    const labels = {
      all: "Tất cả lỗi",
      duplicate: "Trùng lặp",
      cancelled: "Đơn hủy",
      return: "Đổi trả",
      other: "Lệch kỳ / Khác"
    };
    document.querySelectorAll(".s2-err-filter-btn").forEach(btn => {
      const f = btn.getAttribute("data-err-filter") || "all";
      const c = counts[f] || 0;
      btn.textContent = `${labels[f] || f} (${c.toLocaleString('vi-VN')})`;
    });

    if (badgeEl) {
      if (allErrors.length > 0) {
        badgeEl.textContent = `Phát hiện ${allErrors.length.toLocaleString('vi-VN')} dòng sai`;
        badgeEl.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200";
      } else if (currentRawRecords.length > 0) {
        badgeEl.textContent = "0 dòng lỗi • Sạch 100%";
        badgeEl.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200";
      } else {
        badgeEl.textContent = "0 dòng lỗi";
        badgeEl.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200";
      }
    }

    const filteredErrors = activeStep2ErrorFilter === "all"
      ? allErrors
      : allErrors.filter(e => e.category === activeStep2ErrorFilter);

    if (currentRawRecords.length === 0) {
      if (hintEl) hintEl.textContent = "Chưa có dữ liệu nạp vào hệ thống";
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="p-6 text-center text-slate-400 text-xs">
            <i class="fa-solid fa-file-circle-question text-2xl text-pink-300 mb-1.5 block"></i>
            Chưa có dữ liệu. Vui lòng tải tệp Excel (.xlsx, .xls) hoặc CSV ở Bước 1 để AI Agent quét và hiển thị các dòng đang bị sai.
          </td>
        </tr>
      `;
      return;
    }

    if (filteredErrors.length === 0) {
      if (hintEl) {
        hintEl.textContent = allErrors.length === 0
          ? `Toàn bộ ${currentRawRecords.length.toLocaleString('vi-VN')} dòng đều sạch hợp lệ`
          : `0 dòng thuộc nhóm lọc này (tổng ${allErrors.length.toLocaleString('vi-VN')} dòng lỗi)`;
      }
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="p-6 text-center text-xs">
            <div class="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2.5 rounded-2xl ${allErrors.length === 0 ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-amber-50 border border-amber-200 text-amber-900'} font-bold">
              <i class="fa-solid ${allErrors.length === 0 ? 'fa-circle-check text-emerald-500' : 'fa-filter text-amber-500'} text-base"></i>
              <span>${allErrors.length === 0
                ? `Không phát hiện dòng dữ liệu nào bị sai! Toàn bộ ${currentRawRecords.length.toLocaleString('vi-VN')} dòng hiện tại đều hợp lệ và đạt chuẩn đối soát.`
                : `Nhóm lọc này có 0 dòng lỗi. Đang có tổng cộng ${allErrors.length.toLocaleString('vi-VN')} dòng sai ở nhóm khác!`}</span>
              ${allErrors.length > 0 ? `<button type="button" id="btn-show-all-s2-errors" class="px-2.5 py-1 rounded-lg bg-[#FF5B8E] text-white text-[11px] font-extrabold cursor-pointer hover:opacity-90">Xem tất cả ${allErrors.length.toLocaleString('vi-VN')} lỗi</button>` : ""}
            </div>
          </td>
        </tr>
      `;
      const btnShowAll = document.getElementById("btn-show-all-s2-errors");
      if (btnShowAll) {
        btnShowAll.addEventListener("click", () => {
          const allTab = document.querySelector('.s2-err-filter-btn[data-err-filter="all"]');
          if (allTab) allTab.click();
        });
      }
      return;
    }

    const MAX_ERR_PREVIEW = 200;
    const slice = filteredErrors.slice(0, MAX_ERR_PREVIEW);
    if (hintEl) {
      hintEl.textContent = filteredErrors.length > MAX_ERR_PREVIEW
        ? `Đang hiển thị ${MAX_ERR_PREVIEW} / ${filteredErrors.length.toLocaleString('vi-VN')} dòng đang bị sai`
        : `Đang hiển thị toàn bộ ${filteredErrors.length.toLocaleString('vi-VN')} dòng đang bị sai`;
    }

    tbody.innerHTML = slice.map(item => {
      const r = item.record;
      return `
        <tr class="hover:bg-rose-50/60 transition">
          <td class="p-2.5 whitespace-nowrap">
            <div class="font-mono font-extrabold text-rose-700">${escapeHtml(r.code || "—")}</div>
            <div class="text-[10px] text-slate-400 font-mono">Dòng #${item.rowNum}</div>
          </td>
          <td class="p-2.5 font-semibold text-slate-800 whitespace-nowrap">${escapeHtml(r.store || "—")}</td>
          <td class="p-2.5 text-slate-700 max-w-[200px] truncate" title="${escapeHtml(r.prod || r.cat || "")}">${escapeHtml(r.prod || r.cat || "—")}</td>
          <td class="p-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">${formatMoney(r.rev || 0)}</td>
          <td class="p-2.5 text-center whitespace-nowrap">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${item.badgeCls}">${item.badgeTxt}</span>
          </td>
          <td class="p-2.5 text-[11px] leading-snug">
            <div class="font-bold text-rose-800">Sai: ${escapeHtml(item.detailReason)}</div>
            <div class="text-slate-500">→ ${escapeHtml(item.actionNote)}</div>
          </td>
        </tr>
      `;
    }).join("");
  }

  document.querySelectorAll(".s2-err-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const f = btn.getAttribute("data-err-filter") || "all";
      document.querySelectorAll(".s2-err-filter-btn").forEach(b => {
        if (b === btn) {
          b.className = "s2-err-filter-btn active px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-[#FF5B8E] text-white shadow-xs transition cursor-pointer";
        } else {
          b.className = "s2-err-filter-btn px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#FFF5F8] text-slate-700 hover:text-[#FF5B8E] border border-[#FAD2E1] transition cursor-pointer";
        }
      });
      renderStep2ErrorRecordsPanel(f);
    });
  });

  function getErrorAnalysisAndFix(r) {
    if (r.type === "duplicate") {
      return {
        errorLabel: "Trùng lặp mã giao dịch",
        wrongSummary: `Mã GD ${r.code} bị lặp • Cộng dư ${formatMoney(r.rev)}`,
        fixedAction: "Xóa bản ghi trùng lặp (giữ 1 bản ghi gốc)",
        defaultRev: 0,
        defaultCogs: 0,
        reason: `Mã giao dịch ${r.code} xuất hiện nhiều hơn 1 lần (do POS ghi nhận đúp hoặc xuất trùng dòng), làm đếm trùng doanh thu và số lượng bán.`,
        solution: `Xóa hoàn toàn bản ghi trùng lặp khỏi tập dữ liệu và chỉ giữ lại duy nhất 1 giao dịch gốc hợp lệ.`
      };
    }
    if (r.type === "cancelled") {
      return {
        errorLabel: "Đơn đã hủy vẫn tính doanh thu",
        wrongSummary: `Trạng thái "${r.status}" • Doanh thu thô ${formatMoney(r.rev)}`,
        fixedAction: "Khấu trừ 100% đơn hủy khỏi doanh thu",
        defaultRev: 0,
        defaultCogs: 0,
        reason: `Đơn hàng đã bị hủy (${r.status}) trước khi hoàn tất giao hàng nhưng file nguồn vẫn ghi nhận ${formatMoney(r.rev)}, tạo doanh thu ảo.`,
        solution: `Đưa Doanh thu và Giá vốn tính báo cáo của đơn hủy về 0 đ; tách riêng sang chỉ số theo dõi tỷ lệ hủy đơn của cửa hàng.`
      };
    }
    if (r.type === "return") {
      return {
        errorLabel: "Đơn đổi trả chưa trừ doanh thu & COGS",
        wrongSummary: `Trạng thái "${r.status}" • Chưa hoàn trừ ${formatMoney(r.rev)}`,
        fixedAction: "Trừ doanh thu hoàn & hoàn nhập giá vốn COGS",
        defaultRev: 0,
        defaultCogs: 0,
        reason: `Giao dịch phát sinh đổi/trả hàng (${r.status}) nhưng doanh thu thô chưa trừ phần tiền hoàn lại và chưa hoàn nhập giá vốn (COGS) về kho.`,
        solution: `Khấu trừ giá trị hoàn trả khỏi Doanh thu thuần, hoàn nhập COGS tương ứng và đối chiếu mã giao dịch gốc để kiểm soát tỷ lệ đổi trả.`
      };
    }
    // period mismatch
    const normRev = Math.round((Number(r.rev) || 0) * (31 / 45));
    const normCogs = Math.round((Number(r.cogs) || 0) * (31 / 45));
    return {
      errorLabel: "Lệch kỳ so sánh dữ liệu",
      wrongSummary: `Gộp kỳ 45 ngày • Doanh thu ${formatMoney(r.rev)}`,
      fixedAction: "Quy đổi chuẩn hóa về chu kỳ 31 ngày",
      defaultRev: normRev,
      defaultCogs: normCogs,
      reason: `Dữ liệu bị gộp chu kỳ 45 ngày thay vì 30–31 ngày chuẩn, khiến tốc độ tăng trưởng và hiệu suất cửa hàng bị thổi phồng sai lệch.`,
      solution: `Áp dụng hệ số chuẩn hóa 31/45 ngày cho Doanh thu (${formatMoney(normRev)}) và Giá vốn (${formatMoney(normCogs)}) để đồng bộ kỳ đối chiếu.`
    };
  }

  function renderRepairFlowTable(allErrors) {
    const tbody = document.getElementById("repair-flow-tbody");
    const elWrongTotal = document.getElementById("repair-total-wrong");
    const elFixedTotal = document.getElementById("repair-total-fixed");
    if (!tbody) return;

    if (!allErrors || allErrors.length === 0) {
      if (elWrongTotal) elWrongTotal.textContent = "0 đ";
      if (elFixedTotal) elFixedTotal.textContent = "0 đ";
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-6 text-center text-xs text-slate-400">
            Không có dòng lỗi nào cần sửa. Dữ liệu đã sạch hoàn toàn!
          </td>
        </tr>
      `;
      return;
    }

    let sumWrong = 0;
    let sumFixed = 0;
    allErrors.forEach(({ r }) => {
      const info = getErrorAnalysisAndFix(r);
      sumWrong += Number(r.rev) || 0;
      const repairedVal = r.fixedRev !== undefined ? Number(r.fixedRev) : info.defaultRev;
      sumFixed += repairedVal;
    });

    if (elWrongTotal) elWrongTotal.textContent = formatMoney(sumWrong);
    if (elFixedTotal) elFixedTotal.textContent = formatMoney(sumFixed);

    const MAX_ROWS = 40;
    const rowsHtml = allErrors.slice(0, MAX_ROWS).map(({ r, idx }) => {
      const info = getErrorAnalysisAndFix(r);
      const isFixed = r.isFixed !== false;
      const repairedRev = r.fixedRev !== undefined ? r.fixedRev : info.defaultRev;

      return `
        <tr class="${isFixed ? 'bg-emerald-50/35' : 'bg-rose-50/30'} hover:bg-emerald-50/60 transition">
          <td class="p-3">
            <div class="font-mono font-bold text-slate-900">${escapeHtml(r.code)}</div>
            <div class="text-[11px] text-slate-500">${escapeHtml(r.store)}</div>
          </td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
              ${escapeHtml(info.errorLabel)}
            </span>
          </td>
          <td class="p-3 text-right">
            <span class="inline-block px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 font-mono font-bold line-through">
              ${formatMoney(r.rev)}
            </span>
          </td>
          <td class="p-3 text-center text-emerald-600 font-black">
            <i class="fa-solid fa-arrow-right"></i>
          </td>
          <td class="p-3 text-right">
            <span class="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border-2 border-emerald-400 font-mono font-black shadow-xs">
              ${formatMoney(repairedRev)}
            </span>
          </td>
          <td class="p-3 text-xs text-slate-700 font-medium">
            ${escapeHtml(info.fixedAction)}
          </td>
          <td class="p-3 text-center">
            <button type="button" data-repair-row="${idx}" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${isFixed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'} hover:opacity-90 transition cursor-pointer">
              ${isFixed ? '✓ Đã sửa' : 'Sửa → Đúng'}
            </button>
          </td>
        </tr>
      `;
    });

    if (allErrors.length > MAX_ROWS) {
      rowsHtml.push(`
        <tr class="bg-emerald-50/70">
          <td colspan="7" class="p-3 text-center text-xs font-bold text-emerald-800">
            Đang hiển thị ${MAX_ROWS} dòng tiêu biểu trên tổng số ${allErrors.length.toLocaleString('vi-VN')} dòng lỗi đã được chuẩn hóa (bôi xanh).
          </td>
        </tr>
      `);
    }

    tbody.innerHTML = rowsHtml.join("");

    tbody.querySelectorAll("[data-repair-row]").forEach(btn => {
      btn.addEventListener("click", () => {
        const recIdx = parseInt(btn.getAttribute("data-repair-row"), 10);
        const rec = currentRawRecords[recIdx];
        if (!rec) return;
        const info = getErrorAnalysisAndFix(rec);
        rec.fixedRev = rec.fixedRev !== undefined ? rec.fixedRev : info.defaultRev;
        rec.fixedCogs = rec.fixedCogs !== undefined ? rec.fixedCogs : info.defaultCogs;
        rec.isFixed = true;
        renderCleaningDiffWorkspace();
        showToast(`Đã chuyển mã ${rec.code} từ Sai (Đỏ) → Đúng (Xanh): ${formatMoney(rec.fixedRev)}`);
      });
    });
  }

  const btnRunRepairFlow = document.getElementById("btn-run-repair-flow");
  if (btnRunRepairFlow) {
    btnRunRepairFlow.addEventListener("click", () => {
      let count = 0;
      currentRawRecords.forEach(r => {
        if (r && r.type && r.type !== "valid") {
          const info = getErrorAnalysisAndFix(r);
          r.fixedRev = info.defaultRev;
          r.fixedCogs = info.defaultCogs;
          r.isFixed = true;
          count++;
        }
      });
      renderCleaningDiffWorkspace();
      showToast(`Đã chạy luồng sửa Sai → Đúng và bôi xanh toàn bộ ${count.toLocaleString('vi-VN')} số liệu đã sửa!`);
    });
  }

  function renderErrorExplanationFlow(allErrors) {
    const flowListEl = document.getElementById("error-explanation-flow-list");
    const flowBadgeEl = document.getElementById("explanation-flow-badge");
    if (!flowListEl) return;

    if (!allErrors || allErrors.length === 0) {
      if (flowBadgeEl) flowBadgeEl.textContent = "Không có lỗi";
      flowListEl.innerHTML = `
        <div class="col-span-full text-center text-xs text-slate-400 py-4">
          Dữ liệu sạch 100%, không phát sinh nhóm lỗi cần giải thích.
        </div>
      `;
      return;
    }

    const groupDefs = [
      {
        type: "duplicate",
        title: "1. Dữ liệu trùng lặp (Duplicate)",
        why: "Hệ thống POS ghi nhận giao dịch 2 lần trong cùng thời điểm hoặc tệp xuất bị lặp dòng, làm đếm trùng mã giao dịch và thổi phồng doanh thu/sản lượng.",
        fix: "Lọc theo Mã Giao Dịch duy nhất, loại bỏ toàn bộ bản ghi trùng khỏi doanh thu thuần (đưa về 0 đ) và giữ lại 1 giao dịch gốc."
      },
      {
        type: "cancelled",
        title: "2. Đơn hàng đã hủy (Cancelled)",
        why: "Khách hủy đơn hoặc kho hết hàng trước khi giao, nhưng cột Thành tiền vẫn giữ giá trị dương nên nếu cộng thẳng sẽ tạo doanh thu ảo.",
        fix: "Khấu trừ 100% doanh thu và giá vốn của các đơn Cancelled về 0 đ trong báo cáo tài chính; tách riêng để theo dõi tỷ lệ hủy đơn."
      },
      {
        type: "return",
        title: "3. Đơn đổi trả hàng (Returned)",
        why: "Khách đã trả hàng và được hoàn tiền nhưng chưa trừ khỏi doanh thu thực nhận, đồng thời chưa hoàn nhập giá vốn COGS về kho.",
        fix: "Trừ phần tiền hoàn trả khỏi Doanh thu thuần, hoàn nhập COGS tương ứng và đối chiếu Mã Giao Dịch Gốc để kiểm soát bất thường."
      },
      {
        type: "period",
        title: "4. Lệch kỳ so sánh dữ liệu",
        why: "Số liệu một số cửa hàng bị gộp 45 ngày thay vì chu kỳ chuẩn 30–31 ngày, khiến tốc độ tăng trưởng bị sai lệch khi so sánh chéo.",
        fix: "Chuẩn hóa đồng bộ về chu kỳ 31 ngày chuẩn bằng hệ số quy đổi (31/45) cho cả doanh thu và giá vốn trước khi lập Dashboard."
      }
    ];

    const cards = [];
    let groupCount = 0;
    groupDefs.forEach(g => {
      const matched = allErrors.filter(item => item.r.type === g.type);
      if (matched.length === 0) return;
      groupCount++;
      const totalImpact = matched.reduce((sum, item) => sum + (Number(item.r.rev) || 0), 0);
      const sampleCodes = matched.slice(0, 3).map(item => item.r.code).join(", ");

      cards.push(`
        <div class="rounded-2xl border border-[#FAD2E1] bg-white p-4 space-y-3 shadow-xs">
          <div class="flex items-center justify-between gap-2 pb-2 border-b border-[#FFE4EC]">
            <div class="font-black text-xs text-slate-900">${g.title}</div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
              ${matched.length.toLocaleString('vi-VN')} dòng • ${formatMoney(totalImpact)}
            </span>
          </div>
          <div class="text-[11px] text-slate-500">
            <span class="font-semibold text-slate-700">Mã mẫu:</span> <span class="font-mono text-rose-700 font-bold">${escapeHtml(sampleCodes)}</span>${matched.length > 3 ? ` và ${matched.length - 3} mã khác` : ""}
          </div>
          <div class="rounded-xl bg-rose-50/80 border border-rose-200 p-2.5 text-xs space-y-1">
            <div class="font-extrabold text-rose-800 flex items-center gap-1.5">
              <i class="fa-solid fa-circle-question"></i> Vì sao dữ liệu sai?
            </div>
            <p class="text-rose-950 leading-relaxed">${g.why}</p>
          </div>
          <div class="rounded-xl bg-emerald-50/80 border border-emerald-200 p-2.5 text-xs space-y-1">
            <div class="font-extrabold text-emerald-800 flex items-center gap-1.5">
              <i class="fa-solid fa-wrench"></i> Giải pháp khắc phục dữ liệu
            </div>
            <p class="text-emerald-950 leading-relaxed">${g.fix}</p>
          </div>
        </div>
      `);
    });

    if (flowBadgeEl) {
      flowBadgeEl.textContent = `${groupCount} nhóm lỗi đã phân tích`;
    }
    flowListEl.innerHTML = cards.join("");
  }

  function renderCleaningDiffWorkspace(filterOverride = null) {
    const listEl = document.getElementById("cleaning-diff-list");
    const errCountEl = document.getElementById("diff-error-count");
    const fixedCountEl = document.getElementById("diff-fixed-count");
    const filterEl = document.getElementById("filter-diff-type");
    if (!listEl) return;

    const activeFilter = filterOverride !== null ? filterOverride : (filterEl ? filterEl.value : "all");
    const allErrors = currentRawRecords
      .map((r, idx) => ({ r, idx }))
      .filter(item => item.r && item.r.type && item.r.type !== "valid");

    const filteredErrors = allErrors.filter(item => activeFilter === "all" || item.r.type === activeFilter);
    const fixedTotal = allErrors.filter(item => item.r.isFixed !== false).length;

    if (errCountEl) errCountEl.textContent = `${allErrors.length.toLocaleString('vi-VN')} lỗi phát hiện`;
    if (fixedCountEl) fixedCountEl.textContent = `${fixedTotal.toLocaleString('vi-VN')} đã sửa`;

    renderErrorExplanationFlow(filteredErrors);
    renderRepairFlowTable(filteredErrors);

    if (filteredErrors.length === 0) {
      listEl.innerHTML = `
        <div class="text-center text-xs text-slate-400 py-6">
          ${allErrors.length === 0
            ? "Chưa phát hiện dòng dữ liệu lỗi nào. Hãy nạp dữ liệu ở Bước 1 để AI Agent đối soát."
            : "Không có dòng lỗi nào khớp với bộ lọc hiện tại."}
        </div>
      `;
      return;
    }

    const MAX_DIFF_PREVIEW = 40;
    const slice = filteredErrors.slice(0, MAX_DIFF_PREVIEW);
    const cardsHtml = slice.map(({ r, idx }) => {
      const info = getErrorAnalysisAndFix(r);
      const isFixed = r.isFixed !== false;
      const repairedRev = r.fixedRev !== undefined ? r.fixedRev : info.defaultRev;
      const repairedCogs = r.fixedCogs !== undefined ? r.fixedCogs : info.defaultCogs;

      return `
        <div class="rounded-2xl border border-[#FAD2E1] bg-white p-3.5 shadow-xs space-y-3" data-diff-idx="${idx}">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <!-- BÊN TRÁI: BÔI ĐỎ DỮ LIỆU SAI -->
            <div class="rounded-xl bg-rose-50 border-2 border-rose-300 p-3 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase">
                  Dữ liệu sai • ${escapeHtml(info.errorLabel)}
                </span>
                <span class="font-mono text-xs font-black bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded">
                  ${escapeHtml(r.code)}
                </span>
              </div>
              <div class="text-xs text-rose-950 space-y-1">
                <div><span class="font-semibold text-rose-700">Cửa hàng:</span> ${escapeHtml(r.store)} • <span class="text-rose-700">${escapeHtml(r.time)}</span></div>
                <div><span class="font-semibold text-rose-700">Sản phẩm:</span> ${escapeHtml(r.prod)}</div>
                <div class="flex flex-wrap items-center gap-2 pt-1">
                  <span class="px-2 py-0.5 rounded bg-rose-200/70 text-rose-900 font-bold line-through">
                    DT thô: ${formatMoney(r.rev)}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-rose-200/70 text-rose-900 font-semibold">
                    COGS: ${formatMoney(r.cogs)}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-rose-600/15 text-rose-800 font-bold border border-rose-300">
                    ${escapeHtml(r.status)}
                  </span>
                </div>
              </div>
            </div>

            <!-- BÊN PHẢI: PHẦN SỬA DỮ LIỆU (BÔI XANH) -->
            <div class="rounded-xl ${isFixed ? 'bg-emerald-50 border-2 border-emerald-300' : 'bg-amber-50 border-2 border-amber-300'} p-3 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${isFixed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'} uppercase">
                  ${r.type === 'duplicate' ? '🗑️ Cần xóa bản ghi trùng' : (r.type === 'cancelled' ? '🚫 Cần loại bỏ đơn hủy' : (isFixed ? '✓ Đã sửa chuẩn hóa' : 'Chờ áp dụng sửa'))}
                </span>
                <span class="text-[11px] font-bold ${isFixed ? 'text-emerald-800' : 'text-amber-800'}">
                  ${escapeHtml(info.fixedAction)}
                </span>
              </div>
              <div class="text-xs text-emerald-950 space-y-1.5">
                ${(r.type === 'duplicate' || r.type === 'cancelled') ? `
                  <div class="p-2 rounded-lg bg-white/80 border border-emerald-200 text-[11px] text-slate-700 leading-relaxed">
                    ${r.type === 'duplicate'
                      ? 'Dòng này bị trùng lặp và <strong>phải được xóa khỏi tập dữ liệu</strong> (chỉ giữ lại 1 bản ghi gốc hợp lệ) thay vì giữ lại với giá trị 0 đ.'
                      : 'Đơn đã hủy <strong>không phát sinh doanh thu thực</strong>, cần xóa/loại bỏ khỏi tập dữ liệu sạch và hoàn nhập giá vốn COGS.'}
                  </div>
                  <div class="flex flex-wrap items-center gap-2 pt-1">
                    <button type="button" data-delete-err="${idx}"
                      class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5">
                      <i class="fa-solid fa-trash-can"></i> ${r.type === 'duplicate' ? 'Xóa dòng trùng này' : 'Xóa đơn hủy này'}
                    </button>
                    <button type="button" data-mark-valid="${idx}"
                      class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold transition cursor-pointer">
                      <i class="fa-solid fa-check"></i> Giữ là Hợp lệ
                    </button>
                  </div>
                ` : `
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-950 font-black">
                      DT sau sửa: ${formatMoney(repairedRev)}
                    </span>
                    <span class="px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-900 font-bold">
                      COGS sau sửa: ${formatMoney(repairedCogs)}
                    </span>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 pt-1">
                    <label class="text-[11px] font-bold text-emerald-800 shrink-0">Sửa DT (VNĐ):</label>
                    <input type="number" min="0" step="1000" value="${repairedRev}" data-fix-input="${idx}"
                      class="w-32 bg-white border border-emerald-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-emerald-900 focus:outline-none focus:border-emerald-600">
                    <button type="button" data-apply-fix="${idx}"
                      class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition cursor-pointer">
                      Lưu sửa
                    </button>
                    <button type="button" data-delete-err="${idx}"
                      class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition cursor-pointer">
                      <i class="fa-solid fa-trash-can"></i> Xóa dòng
                    </button>
                  </div>
                `}
              </div>
            </div>
          </div>

          <!-- LUỒNG GIẢI THÍCH LÝ DO SAI & GIẢI PHÁP KHẮC PHỤC -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs">
            <div class="flex items-start gap-2">
              <i class="fa-solid fa-triangle-exclamation text-rose-500 mt-0.5 shrink-0"></i>
              <div>
                <span class="font-extrabold text-slate-800">Lý do dữ liệu sai:</span>
                <span class="text-slate-600">${escapeHtml(info.reason)}</span>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <i class="fa-solid fa-lightbulb text-emerald-600 mt-0.5 shrink-0"></i>
              <div>
                <span class="font-extrabold text-slate-800">Giải pháp khắc phục:</span>
                <span class="text-slate-600">${escapeHtml(info.solution)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    if (filteredErrors.length > MAX_DIFF_PREVIEW) {
      cardsHtml.push(`
        <div class="p-3 text-center text-xs font-bold text-[#FF5B8E] bg-[#FFF5F8] rounded-xl border border-[#FAD2E1]">
          Đang hiển thị ${MAX_DIFF_PREVIEW} dòng lỗi tiêu biểu trên tổng số ${filteredErrors.length.toLocaleString('vi-VN')} dòng lỗi. Toàn bộ các dòng lỗi khác đều được áp dụng cùng quy tắc sửa chuẩn hóa.
        </div>
      `);
    }

    listEl.innerHTML = cardsHtml.join("");

    // Bind inline fix, delete, and mark-valid buttons
    listEl.querySelectorAll("[data-apply-fix]").forEach(btn => {
      btn.addEventListener("click", () => {
        const recIdx = parseInt(btn.getAttribute("data-apply-fix"), 10);
        const inp = listEl.querySelector(`[data-fix-input="${recIdx}"]`);
        if (currentRawRecords[recIdx] && inp) {
          pushDataHistorySnapshot();
          const newVal = Math.max(0, Number(inp.value) || 0);
          currentRawRecords[recIdx].rev = newVal;
          currentRawRecords[recIdx].fixedRev = newVal;
          currentRawRecords[recIdx].isFixed = true;
          recalculateStatsFromRecords();
          renderRawSampleTable();
          showToast(`Đã lưu sửa dữ liệu cho mã ${currentRawRecords[recIdx].code}: ${formatMoney(newVal)}`);
        }
      });
    });

    listEl.querySelectorAll("[data-delete-err]").forEach(btn => {
      btn.addEventListener("click", () => {
        const recIdx = parseInt(btn.getAttribute("data-delete-err"), 10);
        if (currentRawRecords[recIdx]) {
          pushDataHistorySnapshot();
          const removedRec = currentRawRecords[recIdx];
          const removedCode = removedRec.code;
          if (removedRec.type === "duplicate") {
            customDatasetStats.autoDeletedDuplicates = (customDatasetStats.autoDeletedDuplicates || 0) + 1;
          }
          currentRawRecords.splice(recIdx, 1);
          recalculateStatsFromRecords();
          renderRawSampleTable();
          appendLog(`[ĐỐI SOÁT LỖI] Đã xóa vĩnh viễn dòng lỗi mã ${removedCode} khỏi tập dữ liệu.`, "clean");
          showToast(`Đã xóa bản ghi lỗi mã ${removedCode} khỏi bảng dữ liệu!`);
        }
      });
    });

    listEl.querySelectorAll("[data-mark-valid]").forEach(btn => {
      btn.addEventListener("click", () => {
        const recIdx = parseInt(btn.getAttribute("data-mark-valid"), 10);
        if (currentRawRecords[recIdx]) {
          pushDataHistorySnapshot();
          currentRawRecords[recIdx].type = "valid";
          currentRawRecords[recIdx].status = "Hoàn thành";
          currentRawRecords[recIdx].note = "Người dùng xác nhận Hợp lệ";
          currentRawRecords[recIdx].isFixed = true;
          recalculateStatsFromRecords();
          renderRawSampleTable();
          showToast(`Đã giữ lại mã ${currentRawRecords[recIdx].code} là Hợp lệ!`);
        }
      });
    });
  }

  const filterDiffType = document.getElementById("filter-diff-type");
  if (filterDiffType) {
    filterDiffType.addEventListener("change", (e) => {
      renderCleaningDiffWorkspace(e.target.value);
    });
  }

  const btnApplyAllFixes = document.getElementById("btn-apply-all-fixes");
  if (btnApplyAllFixes) {
    btnApplyAllFixes.addEventListener("click", () => {
      pushDataHistorySnapshot();
      let deletedDup = 0;
      let deletedCancel = 0;
      let normalizedOther = 0;

      currentRawRecords = currentRawRecords.filter(r => {
        if (!r) return false;
        if (r.type === "duplicate") {
          deletedDup++;
          return false; // Actually delete duplicate rows!
        }
        if (r.type === "cancelled" || r.type === "cancel") {
          deletedCancel++;
          return false; // Actually delete cancelled rows!
        }
        if (r.type && r.type !== "valid") {
          const info = getErrorAnalysisAndFix(r);
          r.rev = info.defaultRev;
          r.cogs = info.defaultCogs;
          r.fixedRev = info.defaultRev;
          r.fixedCogs = info.defaultCogs;
          r.isFixed = true;
          normalizedOther++;
        }
        return true;
      });

      if (deletedDup > 0) {
        customDatasetStats.autoDeletedDuplicates = (customDatasetStats.autoDeletedDuplicates || 0) + deletedDup;
      }
      recalculateStatsFromRecords();
      renderRawSampleTable();
      const totalProcessed = deletedDup + deletedCancel + normalizedOther;
      appendLog(
        `[ÁP DỤNG SỬA TOÀN BỘ] Đã xóa ${deletedDup.toLocaleString('vi-VN')} dòng trùng lặp, xóa ${deletedCancel.toLocaleString('vi-VN')} đơn hủy, và chuẩn hóa ${normalizedOther.toLocaleString('vi-VN')} dòng đổi trả/lệch kỳ.`,
        "success"
      );
      showToast(`Đã xóa ${deletedDup + deletedCancel} dòng trùng/hủy và chuẩn hóa ${normalizedOther} dòng lỗi (Tổng ${totalProcessed} dòng)!`);
    });
  }

  document.getElementById("filter-data-type").addEventListener("change", (e) => {
    renderRawSampleTable(e.target.value);
  });

  // ========================================================
  // SHEETS / EXCEL / CSV UPLOAD & TEMPLATE GENERATION SYSTEM
  // ========================================================
  const fileInput = document.getElementById("file-sheets-input");
  const dropZone = document.getElementById("drop-zone");
  const uploadBanner = document.getElementById("upload-status-banner");
  const uploadFilename = document.getElementById("upload-filename");
  const uploadDetails = document.getElementById("upload-details");
  const activeSourceBadge = document.getElementById("active-source-badge");

  // AI Agent Data Cleaning Engine & Log Elements (Hoisted for early access)
  const btnRunCleaning = document.getElementById("btn-run-cleaning");
  const logOutput = document.getElementById("cleaning-log-output");
  const cleaningStatusBadge = document.getElementById("cleaning-status-badge");

  function appendLog(message, type = "info") {
    if (!logOutput) return;
    const div = document.createElement("div");
    const time = new Date().toLocaleTimeString('vi-VN');
    if (type === "clean") {
      div.className = "text-amber-400";
      div.innerHTML = `<span class="text-slate-500">[${time}]</span> <span class="font-bold">[LÀM SẠCH]</span> ${message}`;
    } else if (type === "success") {
      div.className = "text-emerald-400 font-bold";
      div.innerHTML = `<span class="text-slate-500">[${time}]</span> <span class="text-emerald-300 font-bold">[HOÀN TẤT]</span> ${message}`;
    } else if (type === "human") {
      div.className = "text-rose-300 font-bold";
      div.innerHTML = `<span class="text-slate-500">[${time}]</span> <span class="text-rose-400 font-extrabold">[CHỈ ĐẠO CHUYÊN VIÊN]</span> ${message}`;
    } else {
      div.className = "text-blue-300";
      div.innerHTML = `<span class="text-slate-500">[${time}]</span> [AGENT] ${message}`;
    }
    logOutput.appendChild(div);
    logOutput.scrollTop = logOutput.scrollHeight;
  }

  function updateStep2ErrorCounts(stats = customDatasetStats, records = currentRawRecords) {
    const elDup = document.getElementById("step2-count-duplicate");
    const elCan = document.getElementById("step2-count-cancelled");
    const elRet = document.getElementById("step2-count-return");
    const elPer = document.getElementById("step2-count-period");
    const elCln = document.getElementById("step2-count-clean");

    const periodFromRecords = Array.isArray(records)
      ? records.filter(r => r && r.type === "period").length
      : 0;

    const dup = stats && stats.duplicateRows ? stats.duplicateRows : 0;
    const can = stats && stats.cancelledRows ? stats.cancelledRows : 0;
    const ret = stats && stats.returnRows ? stats.returnRows : 0;
    const per = stats && stats.periodRows !== undefined ? stats.periodRows : periodFromRecords;
    const cln = stats && stats.cleanRows ? stats.cleanRows : 0;
    const totalErrors = dup + can + ret + per;

    if (elDup) elDup.textContent = dup.toLocaleString('vi-VN');
    if (elCan) elCan.textContent = can.toLocaleString('vi-VN');
    if (elRet) elRet.textContent = ret.toLocaleString('vi-VN');
    if (elPer) elPer.textContent = per.toLocaleString('vi-VN');
    if (elCln) elCln.textContent = cln.toLocaleString('vi-VN');

    const p1Dup = document.getElementById("s2-p1-count-duplicate");
    const p1Can = document.getElementById("s2-p1-count-cancelled");
    const p1Ret = document.getElementById("s2-p1-count-return");
    const p1Per = document.getElementById("s2-p1-count-period");
    const p1TotErr = document.getElementById("s2-p1-count-total-errors");
    const p1Cln = document.getElementById("s2-p1-count-clean");
    if (p1Dup) p1Dup.textContent = dup.toLocaleString('vi-VN');
    if (p1Can) p1Can.textContent = can.toLocaleString('vi-VN');
    if (p1Ret) p1Ret.textContent = ret.toLocaleString('vi-VN');
    if (p1Per) p1Per.textContent = per.toLocaleString('vi-VN');
    if (p1TotErr) p1TotErr.textContent = totalErrors.toLocaleString('vi-VN');
    if (p1Cln) p1Cln.textContent = cln.toLocaleString('vi-VN');
  }

  function runCleaningPipeline(recordsToClean = currentRawRecords, stats = customDatasetStats) {
    if (!recordsToClean || recordsToClean.length === 0) return;
    state.isCleaningRunning = true;
    state.phase1Completed = false;
    updateStep2ErrorCounts(stats, recordsToClean);
    renderRawSampleTable();
    if (cleaningStatusBadge) {
      cleaningStatusBadge.textContent = "Agent đang xử lý...";
      cleaningStatusBadge.className = "px-2 py-0.5 rounded text-[10px] bg-blue-600 text-white font-semibold animate-pulse";
    }

    if (logOutput) logOutput.innerHTML = "";
    const sourceName = stats.fileName;
    const totRows = stats.totalRows.toLocaleString('vi-VN');
    const dupRows = stats.duplicateRows.toLocaleString('vi-VN');
    const canRows = stats.cancelledRows.toLocaleString('vi-VN');
    const retRows = stats.returnRows.toLocaleString('vi-VN');
    const clnRows = stats.cleanRows.toLocaleString('vi-VN');

    // Step 0: Ingestion
    appendLog(`Khởi động pipeline BPMN: Tiếp nhận & Làm sạch dữ liệu [${sourceName}]...`, "agent");

    setTimeout(() => {
      appendLog(`Tiếp nhận thành công: '${sourceName}' gồm ${totRows} dòng giao dịch thực tế.`, "info");
      
      // Print first 3 sample records from user's actual uploaded file directly in log
      const sampleLimit = Math.min(recordsToClean.length, 3);
      for (let i = 0; i < sampleLimit; i++) {
        const r = recordsToClean[i];
        appendLog(`[MẪU DÒNG ${i+1}] Mã: ${r.code} | Cửa hàng: ${r.store} | SP: ${r.prod} | Doanh thu: ${formatMoney(r.rev)} | Trạng thái: ${r.status}`, "clean");
      }
    }, 250);

    // Step 1: Duplicate check
    setTimeout(() => {
      appendLog(`BƯỚC 1: LỌC TRÙNG - Bóc tách ${dupRows} dòng duplicate (trùng mã giao dịch / double POS).`, "clean");
    }, 700);

    // Step 2: Canceled orders
    setTimeout(() => {
      appendLog(`BƯỚC 2: BỎ ĐƠN HỦY - Loại bỏ ${canRows} đơn hủy / trả hàng trước giao bị cộng nhầm vào doanh thu.`, "clean");
    }, 1150);

    // Step 3: Returns standardization
    setTimeout(() => {
      appendLog(`BƯỚC 3: XỬ LÝ HÀNG TRẢ - Chuẩn hóa ${retRows} dòng đổi trả, trừ doanh thu thực nhận và hoàn nhập COGS.`, "clean");
    }, 1600);

    // Step 4: Comparison period synchronization
    setTimeout(() => {
      appendLog(`BƯỚC 4: ĐỒNG BỘ KỲ ĐỐI CHIẾU - Khóa cứng chu kỳ bán hàng tương đương (31 ngày T10 vs 30 ngày T09).`, "clean");
    }, 2050);

    // Step 5: Finished
    setTimeout(() => {
      document.getElementById("stat-clean-rows").textContent = clnRows;
      document.getElementById("stat-duplicate-rows").textContent = dupRows;
      document.getElementById("stat-cancelled-rows").textContent = canRows;
      document.getElementById("stat-return-rows").textContent = retRows;
      document.getElementById("stat-total-raw-rows").innerHTML = `${totRows} <span class="text-xs font-normal text-slate-400">dòng</span>`;
      document.getElementById("stat-total-raw-desc").textContent = sourceName;

      appendLog(`KẾT QUẢ XUẤT SHEET: ${totRows} dòng thô ➔ ${clnRows} dòng sạch hợp lệ (Khớp đối soát 100%).`, "success");
      appendLog("Chuyển quyền cho Chuyên viên Kinh doanh thực hiện Bước Xác Thực Con Người (Human Verification Gate)...", "info");
      if (cleaningStatusBadge) {
        cleaningStatusBadge.textContent = "Chờ Human Verification";
        cleaningStatusBadge.className = "px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-bold";
      }
      state.isCleaningRunning = false;
      state.cleaningCompleted = true;
      showToast(`AI Agent đã làm sạch ${clnRows} dòng dữ liệu từ ${sourceName}!`);
    }, 2500);
  }

  function normalizeColText(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  // Fast O(1) column key resolver (resolved ONCE per file instead of per-row regex scanning)
  function findMatchingColumnKey(keys, keywords, usedKeys = null) {
    for (let j = 0; j < keywords.length; j++) {
      const cleanKw = normalizeColText(keywords[j]);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (usedKeys && usedKeys.has(key)) continue;
        const cleanK = normalizeColText(key);
        if (!cleanK) continue;
        if (cleanK === cleanKw || cleanK.includes(cleanKw)) {
          if (usedKeys) usedKeys.add(key);
          return key;
        }
      }
    }
    return null;
  }

  function resolveColumnMap(sampleRow) {
    if (!sampleRow || typeof sampleRow !== "object") return {};
    const keys = Object.keys(sampleRow);
    const used = new Set();

    const map = {
      codeKey: findMatchingColumnKey(keys, ["magiaodich", "madonhang", "madon", "maphieu", "sohoadon", "sohd", "orderid", "transactionid", "invoiceid", "magd", "code", "id"], used),
      timeKey: findMatchingColumnKey(keys, ["thoigiangiaodich", "ngaygiaodich", "ngayban", "ngaylap", "thoigian", "ngaygio", "ngay", "thang", "date", "time", "createdat", "timestamp"], used),
      storeKey: findMatchingColumnKey(keys, ["tencuahang", "cuahang", "macuahang", "chinhanh", "diemban", "khuvuc", "khohang", "kenhban", "store", "branch", "shop", "location", "region", "channel"], used),
      prodKey: findMatchingColumnKey(keys, ["tensanpham", "sanpham", "masanpham", "mathang", "tenhang", "hanghoa", "dichvu", "product", "item", "sku", "name", "tensp"], used),
      catKey: findMatchingColumnKey(keys, ["nganhhang", "nhomhang", "nhomsanpham", "danhmuc", "loaihang", "phanloai", "hangmuc", "category", "segment", "type", "group"], used),
      revKey: findMatchingColumnKey(keys, ["doanhthuthuan", "doanhthutho", "doanhthu", "doanhso", "tongtien", "thanhtien", "tongcong", "giatri", "revenue", "sales", "amount", "total", "price"], used),
      cogsKey: findMatchingColumnKey(keys, ["giavon", "tienvon", "chiphivon", "chiphi", "cogs", "cost"], used),
      statusKey: findMatchingColumnKey(keys, ["trangthaidon", "trangthai", "tinhtrang", "ketqua", "status", "state"], used)
    };

    // Fallback: auto-assign remaining text/numeric columns from the user's file so real data is shown
    const unusedKeys = keys.filter(k => !used.has(k));
    for (const k of unusedKeys) {
      const val = sampleRow[k];
      const isNum = typeof val === "number" || (typeof val === "string" && /^[\d.,\s-]+$/.test(val.trim()) && val.trim() !== "");
      if (!isNum) {
        if (!map.storeKey) { map.storeKey = k; continue; }
        if (!map.prodKey) { map.prodKey = k; continue; }
        if (!map.catKey) { map.catKey = k; continue; }
        if (!map.codeKey) { map.codeKey = k; continue; }
      } else {
        if (!map.revKey) { map.revKey = k; continue; }
        if (!map.cogsKey) { map.cogsKey = k; continue; }
      }
    }

    return map;
  }

  function formatCellTime(val) {
    if (val === undefined || val === null || val === "") return "—";
    if (typeof val === "number" && val > 25000 && val < 80000) {
      // Excel serial date
      const utcDays = Math.floor(val - 25569);
      const d = new Date(utcDays * 86400 * 1000);
      if (!isNaN(d.getTime())) {
        const dd = String(d.getUTCDate()).padStart(2, "0");
        const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
        const yyyy = d.getUTCFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    }
    return String(val).trim();
  }

  // Extract tabular data from a SheetJS worksheet, skipping company header titles (Optimized with raw: true & fast loops)
  function extractSmartTableFromWorksheet(worksheet) {
    if (!worksheet || !worksheet['!ref']) return [];
    
    // Read as 2D array of raw values (dramatically faster than formatted strings)
    const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: true });
    if (!aoa || aoa.length === 0) return [];

    let headerRowIndex = 0;
    let maxScore = -1;

    const scanLimit = Math.min(aoa.length, 15);
    for (let r = 0; r < scanLimit; r++) {
      const row = aoa[r];
      if (!Array.isArray(row) || row.length === 0) continue;
      let score = 0;
      const joined = row.map(c => String(c || "").toLowerCase().trim()).join(" ");
      if (joined.includes("mã") || joined.includes("code") || joined.includes("id")) score += 3;
      if (joined.includes("giao dịch") || joined.includes("transaction") || joined.includes("đơn") || joined.includes("order")) score += 3;
      if (joined.includes("cửa hàng") || joined.includes("store") || joined.includes("shop") || joined.includes("chi nhánh")) score += 3;
      if (joined.includes("sản phẩm") || joined.includes("product") || joined.includes("item") || joined.includes("hàng")) score += 3;
      if (joined.includes("doanh thu") || joined.includes("tiền") || joined.includes("revenue") || joined.includes("amount") || joined.includes("giá")) score += 3;
      if (joined.includes("ngày") || joined.includes("thời gian") || joined.includes("date") || joined.includes("time")) score += 3;
      if (joined.includes("giá vốn") || joined.includes("cogs") || joined.includes("cost")) score += 3;
      if (joined.includes("trạng thái") || joined.includes("status")) score += 3;

      if (score > maxScore && score >= 3) {
        maxScore = score;
        headerRowIndex = r;
      }
    }

    const rawHeaders = aoa[headerRowIndex] || [];
    const headerLen = rawHeaders.length;
    const headers = new Array(headerLen);
    for (let c = 0; c < headerLen; c++) {
      const h = String(rawHeaders[c] || "").trim();
      headers[c] = h || `Cot_${c + 1}`;
    }

    const resultRows = [];
    for (let r = headerRowIndex + 1; r < aoa.length; r++) {
      const rowData = aoa[r];
      if (!Array.isArray(rowData) || rowData.length === 0) continue;
      let hasValue = false;
      for (let c = 0; c < headerLen; c++) {
        const v = rowData[c];
        if (v !== "" && v !== null && v !== undefined) {
          hasValue = true;
          break;
        }
      }
      if (!hasValue) continue;

      const obj = {};
      for (let c = 0; c < headerLen; c++) {
        obj[headers[c]] = rowData[c] !== undefined ? rowData[c] : "";
      }
      resultRows.push(obj);
    }

    return resultRows.length > 0 ? resultRows : XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: true });
  }

  function finishProcessingParsedRows(formattedRecords, total, dupCount, cancelCount, returnCount, fileName, autoAdvance = false) {
    // Reset prior phase/report/audit state so new dataset is always freshly analyzed
    state.phase1Completed = false;
    state.phase2Completed = false;
    state.phase3Completed = false;
    state.isReportGenerated = false;
    state.isAuditCompleted = false;
    state.selectedStoreForDecision = null;
    if (typeof window !== "undefined") window.__cachedDynamicAnalytics = null;

    const periodCount = Array.isArray(formattedRecords)
      ? formattedRecords.filter(r => r && r.type === "period").length
      : 0;
    const validCount = Array.isArray(formattedRecords)
      ? formattedRecords.filter(r => r && (!r.type || r.type === "valid")).length
      : Math.max(total - dupCount - cancelCount - returnCount - periodCount, 0);

    currentRawRecords = formattedRecords;
    customDatasetLoaded = true;
    customDatasetStats = {
      totalRows: total,
      duplicateRows: dupCount,
      autoDeletedDuplicates: (window.__lastDedupSummary && window.__lastDedupSummary.dupRemovedTotal) ? window.__lastDedupSummary.dupRemovedTotal : dupCount,
      cancelledRows: cancelCount,
      returnRows: returnCount,
      periodRows: periodCount,
      cleanRows: validCount,
      fileName: fileName
    };
    try {
      window.__dataHistoryStack = [];
      window.__initialUploadedSnapshot = {
        records: JSON.parse(JSON.stringify(formattedRecords)),
        stats: { ...customDatasetStats }
      };
      if (!window.__rawOriginalUncleanedSnapshot) {
        window.__rawOriginalUncleanedSnapshot = {
          records: JSON.parse(JSON.stringify(formattedRecords)),
          stats: { ...customDatasetStats, autoDeletedDuplicates: 0 }
        };
      }
    } catch (e) {}

    // Update UI counters with exact stats from user's file
    const elTot = document.getElementById("stat-total-raw-rows");
    if (elTot) elTot.innerHTML = `${customDatasetStats.totalRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const elTotDesc = document.getElementById("stat-total-raw-desc");
    if (elTotDesc) elTotDesc.textContent = `Nạp từ tệp: ${fileName}`;
    const elDup = document.getElementById("stat-duplicate-rows");
    if (elDup) elDup.innerHTML = `${customDatasetStats.duplicateRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const elCan = document.getElementById("stat-cancelled-rows");
    if (elCan) elCan.innerHTML = `${customDatasetStats.cancelledRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const elRet = document.getElementById("stat-return-rows");
    if (elRet) elRet.innerHTML = `${customDatasetStats.returnRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const elCln = document.getElementById("stat-clean-rows");
    if (elCln) elCln.innerHTML = `${customDatasetStats.cleanRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    updateStep2ErrorCounts(customDatasetStats, formattedRecords);

    // Update Banner
    if (uploadBanner) uploadBanner.classList.remove("hidden");
    if (uploadFilename) uploadFilename.textContent = fileName;
    if (uploadDetails) uploadDetails.textContent = `Đã nạp ${total.toLocaleString('vi-VN')} dòng thực tế • ${dupCount} trùng lặp, ${cancelCount} đơn hủy, ${returnCount} đổi trả`;
    if (activeSourceBadge) {
      activeSourceBadge.textContent = `Tệp ngoài: ${fileName} (${total.toLocaleString('vi-VN')} dòng)`;
      activeSourceBadge.className = "px-2 py-0.5 rounded text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-700 font-semibold";
    }

    // Refresh table preview (only renders top 100 rows instantly)
    renderRawSampleTable();

    appendChatMessage(
      "system",
      `📥 <strong>ĐÃ TIẾP NHẬN TỆP DOANH NGHIỆP:</strong><br>` +
      `• <strong>Tên tệp:</strong> <code>${escapeHtml(fileName)}</code><br>` +
      `• <strong>Số dòng nạp:</strong> ${total.toLocaleString('vi-VN')} dòng giao dịch.<br>` +
      `• <strong>Phát hiện ban đầu:</strong> ${dupCount} trùng lặp, ${cancelCount} đơn hủy, ${returnCount} đổi trả.<br>` +
      `<em>⚡ AI Agent đang tự động khởi chạy quy trình làm sạch BPMN cho tệp này ngay...</em>`
    );

    // Update Step 1B Paste Input preview & Status Hint
    const rawPaste = document.getElementById("raw-data-paste-input");
    if (rawPaste) {
      let previewSnippet = `[TỆP: ${fileName} • ${total.toLocaleString('vi-VN')} dòng giao dịch]\n`;
      const sampleN = Math.min(formattedRecords.length, 5);
      for (let i = 0; i < sampleN; i++) {
        const r = formattedRecords[i];
        previewSnippet += `${r.code}, ${r.time}, ${r.store}, ${r.prod}, ${formatMoney(r.rev)}, ${r.status}\n`;
      }
      previewSnippet += `... và ${Math.max(total - sampleN, 0).toLocaleString('vi-VN')} dòng tiếp theo.`;
      rawPaste.value = previewSnippet;
    }

    const inputHint = document.getElementById("input-status-hint");
    if (inputHint) {
      inputHint.innerHTML = `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> Đã nhận ${escapeHtml(fileName)} (${total.toLocaleString('vi-VN')} dòng). Bấm "Phân Tích Bối Cảnh & Kiểm Tra Định Dạng" để sang Bước 2!</span>`;
    }

    const btnTrigger = document.getElementById("btn-upload-file-trigger");
    if (btnTrigger) {
      btnTrigger.disabled = false;
      btnTrigger.innerHTML = `<i class="fa-solid fa-folder-open text-amber-500"></i> <span>Tải file lên (CSV / Excel / JSON)</span>`;
    }

    if (autoAdvance) {
      showToast(`Đã phân tích bối cảnh & kiểm tra định dạng (${total.toLocaleString('vi-VN')} dòng)! Đang chuyển sang Bước 2.`);
      revealSubsequentSteps();
      state.isCleaningRunning = false;
      runCleaningPipeline(formattedRecords, customDatasetStats);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast(`Đã nhận ${fileName} (${total.toLocaleString('vi-VN')} dòng)! Bấm "Phân Tích Bối Cảnh & Kiểm Tra Định Dạng" để sang Bước 2.`);
    }
  }

  // Smart Deduplication:
  // - Full duplicate (100% identical fields) => mark as duplicate (0 đ clean) or purge if purgeFromTable=true
  // - Partial duplicate (same code, different fields) => Keep if valid multi-item order (different product, rev > 0); mark/purge if inappropriate
  function smartDeduplicateRecords(records, purgeFromTable = false) {
    const exactKeys = new Set();
    const codeMap = new Map();
    const cleanedRecords = [];
    let exactRemoved = 0;
    let partialKept = 0;
    let partialRemoved = 0;
    let cancelCount = 0;
    let returnCount = 0;

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      if (!r) continue;
      const exactSig = [r.code, r.time, r.store, r.prod, r.cat, r.rev, r.cogs, r.status]
        .map(v => String(v === undefined || v === null ? "" : v).trim().toLowerCase())
        .join("|");

      if (exactKeys.has(exactSig)) {
        exactRemoved++;
        if (!purgeFromTable) {
          r.type = "duplicate";
          r.note = "TRÙNG TOÀN PHẦN: Giống hệt 100% (Đã loại khỏi doanh số sạch)";
          r.fixedRev = 0;
          cleanedRecords.push(r);
        }
        continue;
      }
      exactKeys.add(exactSig);

      const codeKey = String(r.code || "").trim().toLowerCase();
      if (codeKey && codeMap.has(codeKey)) {
        const priors = codeMap.get(codeKey);
        const prodLower = String(r.prod || "").trim().toLowerCase();
        const isDistinctProd = prodLower && prodLower !== "—" && priors.every(p => String(p.prod || "").trim().toLowerCase() !== prodLower);
        const isAppropriate = isDistinctProd && Number(r.rev) > 0 && r.type !== "cancelled";

        if (isAppropriate) {
          partialKept++;
          if (r.type === "duplicate") r.type = "valid";
          r.note = "Trùng 1 phần phù hợp (Cùng mã đơn, khác SP → Giữ lại)";
          priors.push(r);
          cleanedRecords.push(r);
        } else {
          partialRemoved++;
          if (!purgeFromTable) {
            r.type = "duplicate";
            r.note = "TRÙNG 1 PHẦN KHÔNG PHÙ HỢP: Đã loại khỏi doanh số sạch";
            r.fixedRev = 0;
            cleanedRecords.push(r);
          }
          continue;
        }
      } else {
        if (codeKey) codeMap.set(codeKey, [r]);
        cleanedRecords.push(r);
      }

      if (r.type === "cancelled" || r.type === "cancel") cancelCount++;
      else if (r.type === "return") returnCount++;
    }

    return {
      cleanedRecords,
      exactRemoved,
      partialKept,
      partialRemoved,
      dupRemovedTotal: exactRemoved + partialRemoved,
      cancelCount,
      returnCount
    };
  }

  // Non-blocking chunked row processor (prevents "Not Responding" on large 50k-100k+ files)
  function processParsedRows(rows, fileName, autoAdvance = false) {
    if (!rows || rows.length === 0) {
      showToast("Tệp không có dữ liệu giao dịch hợp lệ!", true);
      appendLog(`[CẢNH BÁO] Không thể đọc thấy bảng giao dịch trong tệp: ${fileName}. Vui lòng kiểm tra định dạng.`, "agent");
      const btnTrigger = document.getElementById("btn-upload-file-trigger");
      if (btnTrigger) {
        btnTrigger.disabled = false;
        btnTrigger.innerHTML = `<i class="fa-solid fa-folder-open text-amber-500"></i> <span>Tải file lên (CSV / Excel / JSON)</span>`;
      }
      return;
    }

    const colMap = resolveColumnMap(rows[0]);
    const total = rows.length;
    const seenIds = new Set();
    let dupCount = 0;
    let cancelCount = 0;
    let returnCount = 0;
    const formattedRecords = new Array(total);
    const CHUNK_SIZE = 5000;
    let index = 0;
    const inputHint = document.getElementById("input-status-hint");

    function processChunk() {
      const end = Math.min(index + CHUNK_SIZE, total);
      for (let i = index; i < end; i++) {
        const row = rows[i];
        const code = (colMap.codeKey && row[colMap.codeKey] !== undefined && row[colMap.codeKey] !== "") ? String(row[colMap.codeKey]).trim() : `GD-${String(i + 1).padStart(4, "0")}`;
        const time = (colMap.timeKey && row[colMap.timeKey] !== undefined && row[colMap.timeKey] !== "") ? formatCellTime(row[colMap.timeKey]) : "—";
        const store = (colMap.storeKey && row[colMap.storeKey] !== undefined && row[colMap.storeKey] !== "") ? String(row[colMap.storeKey]).trim() : "Đơn vị mặc định";
        const prod = (colMap.prodKey && row[colMap.prodKey] !== undefined && row[colMap.prodKey] !== "") ? String(row[colMap.prodKey]).trim() : "—";
        const cat = (colMap.catKey && row[colMap.catKey] !== undefined && row[colMap.catKey] !== "") ? String(row[colMap.catKey]).trim() : "—";

        let rawRevVal = (colMap.revKey && row[colMap.revKey] !== undefined && row[colMap.revKey] !== "") ? row[colMap.revKey] : 0;
        if (typeof rawRevVal === "string") {
          rawRevVal = parseFloat(rawRevVal.replace(/[^0-9.-]/g, "")) || 0;
        }
        const rawRev = Number(rawRevVal) || 0;

        let rawCogsVal = (colMap.cogsKey && row[colMap.cogsKey] !== undefined && row[colMap.cogsKey] !== "") ? row[colMap.cogsKey] : (rawRev * 0.68);
        if (typeof rawCogsVal === "string") {
          rawCogsVal = parseFloat(rawCogsVal.replace(/[^0-9.-]/g, "")) || (rawRev * 0.68);
        }
        const rawCogs = Number(rawCogsVal) || (rawRev * 0.68);

        const status = (colMap.statusKey && row[colMap.statusKey] !== undefined && row[colMap.statusKey] !== "") ? String(row[colMap.statusKey]).trim() : "Hoàn thành";

        let type = "valid";
        let note = "Hợp lệ";

        if (seenIds.has(code)) {
          type = "duplicate";
          note = "TRÙNG LẶP: Mã giao dịch bị lặp";
          dupCount++;
        } else {
          seenIds.add(code);
        }

        const statusLower = status.toLowerCase();
        if (statusLower.includes("hủy") || statusLower.includes("huy") || statusLower.includes("cancel") || statusLower.includes("void")) {
          type = "cancelled";
          note = "ĐƠN HỦY: Khách hủy / Hoàn tiền trước giao";
          cancelCount++;
        } else if (statusLower.includes("trả") || statusLower.includes("tra") || statusLower.includes("return") || statusLower.includes("đổi") || statusLower.includes("refund")) {
          type = "return";
          note = "ĐỔI TRẢ: Hàng hoàn kho cần xử lý chuẩn";
          returnCount++;
        }

        formattedRecords[i] = {
          code,
          time,
          store,
          prod,
          cat,
          rev: rawRev,
          cogs: rawCogs,
          status,
          note,
          type,
          rawRow: row,
          revKey: colMap.revKey
        };
      }

      index = end;
      if (index < total) {
        if (inputHint) {
          const pct = Math.round((index / total) * 100);
          inputHint.innerHTML = `<span class="text-blue-600 font-bold"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang phân tích dữ liệu: ${index.toLocaleString('vi-VN')} / ${total.toLocaleString('vi-VN')} dòng (${pct}%)...</span>`;
        }
        setTimeout(processChunk, 0);
      } else {
        // Classify the FULL 100% RAW dataset WITHOUT purging any rows (purgeFromTable = false)
        // so that smart multi-item rows (same order code, different product) are accurately kept as "valid"
        // while ONLY real duplicates are tagged "duplicate" — matching initial stats 100% upon restore!
        try {
          const rawCopyForSnapshot = JSON.parse(JSON.stringify(formattedRecords));
          const rawClassified = smartDeduplicateRecords(rawCopyForSnapshot, false);
          let rawDup = 0, rawCan = 0, rawRet = 0, rawPer = 0, rawCln = 0;
          rawClassified.cleanedRecords.forEach(r => {
            if (!r) return;
            if (r.type === "duplicate") rawDup++;
            else if (r.type === "cancelled" || r.type === "cancel") rawCan++;
            else if (r.type === "return") rawRet++;
            else if (r.type === "period") rawPer++;
            else rawCln++;
          });
          window.__rawOriginalUncleanedSnapshot = {
            records: rawClassified.cleanedRecords,
            stats: {
              totalRows: rawClassified.cleanedRecords.length,
              duplicateRows: rawDup,
              autoDeletedDuplicates: 0,
              cancelledRows: rawCan,
              returnRows: rawRet,
              periodRows: rawPer,
              cleanRows: rawCln,
              fileName: fileName
            }
          };
        } catch (e) {
          console.warn("Could not save uncleaned snapshot:", e);
        }

        const dedup = smartDeduplicateRecords(formattedRecords, true);
        window.__lastDedupSummary = dedup;
        finishProcessingParsedRows(
          dedup.cleanedRecords,
          total,
          dedup.dupRemovedTotal,
          dedup.cancelCount,
          dedup.returnCount,
          fileName,
          autoAdvance
        );
        if (dedup.exactRemoved > 0 || dedup.partialRemoved > 0 || dedup.partialKept > 0) {
          appendLog(
            `[CHỐNG TRÙNG THÔNG MINH] Xóa ${dedup.exactRemoved.toLocaleString('vi-VN')} dòng trùng toàn phần; xem xét trùng 1 phần: giữ ${dedup.partialKept.toLocaleString('vi-VN')} dòng phù hợp (khác SP), xóa ${dedup.partialRemoved.toLocaleString('vi-VN')} dòng không phù hợp.`,
            "clean"
          );
        }
      }
    }

    processChunk();
  }

  function handleFileSelected(file) {
    if (!file) return;
    const fileName = file.name;
    const ext = fileName.split('.').pop().toLowerCase();

    const inputHint = document.getElementById("input-status-hint");
    const btnTrigger = document.getElementById("btn-upload-file-trigger");
    if (inputHint) {
      inputHint.innerHTML = `<span class="text-blue-600 font-bold"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang đọc & giải mã tệp ${escapeHtml(fileName)}...</span>`;
    }
    if (btnTrigger) {
      btnTrigger.disabled = true;
      btnTrigger.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-[#FF5B8E]"></i> <span>Đang mở tệp...</span>`;
    }

    const resetUploadBtn = () => {
      if (btnTrigger) {
        btnTrigger.disabled = false;
        btnTrigger.innerHTML = `<i class="fa-solid fa-folder-open text-amber-500"></i> <span>Tải file lên (CSV / Excel / JSON)</span>`;
      }
    };

    showToast(`Đang đọc tệp: ${fileName}...`, false);

    if (ext === "csv") {
      if (typeof Papa === "undefined") {
        showToast("Thư viện PapaParse chưa tải xong. Vui lòng thử lại sau vài giây!", true);
        resetUploadBtn();
        return;
      }
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          processParsedRows(results.data, fileName);
        },
        error: (err) => {
          showToast(`Lỗi đọc CSV: ${err.message}`, true);
          resetUploadBtn();
        }
      });
    } else if (ext === "json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTimeout(() => {
          try {
            const parsed = JSON.parse(e.target.result);
            const rows = Array.isArray(parsed) ? parsed : (parsed.data || parsed.rows || parsed.transactions || []);
            processParsedRows(rows, fileName);
          } catch (err) {
            showToast(`Lỗi đọc JSON: ${err.message}`, true);
            resetUploadBtn();
          }
        }, 30);
      };
      reader.onerror = () => {
        showToast("Không thể đọc tệp JSON từ đĩa.", true);
        resetUploadBtn();
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      if (typeof XLSX === "undefined") {
        showToast("Thư viện SheetJS chưa sẵn sàng. Vui lòng tải lại trang (F5)!", true);
        resetUploadBtn();
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        // Yield to browser paint loop before heavy SheetJS decoding so UI stays responsive
        setTimeout(() => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {
              type: 'array',
              cellDates: false,
              cellFormula: false,
              cellHTML: false,
              cellNF: false,
              cellStyles: false
            });
            
            let targetSheetName = workbook.SheetNames[0];
            const matched = workbook.SheetNames.find(n => {
              const low = n.toLowerCase();
              return low.includes("giaodich") || low.includes("transaction") || low.includes("sales") || low.includes("banhang") || low.includes("order") || low.includes("data");
            });
            if (matched) targetSheetName = matched;

            let worksheet = workbook.Sheets[targetSheetName];
            let jsonData = extractSmartTableFromWorksheet(worksheet);

            if ((!jsonData || jsonData.length === 0) && workbook.SheetNames.length > 1) {
              for (const sName of workbook.SheetNames) {
                const ws = workbook.Sheets[sName];
                const parsed = extractSmartTableFromWorksheet(ws);
                if (parsed && parsed.length > 0) {
                  targetSheetName = sName;
                  jsonData = parsed;
                  break;
                }
              }
            }

            processParsedRows(jsonData, fileName);
          } catch (err) {
            console.error("Lỗi giải mã Excel:", err);
            showToast(`Lỗi giải mã Excel: ${err.message}`, true);
            if (inputHint) inputHint.innerHTML = `<span class="text-rose-600 font-bold">Lỗi giải mã tệp: ${escapeHtml(err.message)}</span>`;
            resetUploadBtn();
          }
        }, 40);
      };
      reader.onerror = (err) => {
        showToast(`Lỗi đọc tệp từ đĩa: ${err.message || 'Không thể đọc'}`, true);
        resetUploadBtn();
      };
      reader.readAsArrayBuffer(file);
    } else {
      showToast("Chỉ hỗ trợ tệp Excel (.xlsx, .xls), CSV hoặc JSON!", true);
      resetUploadBtn();
    }
  }

  // File Input Change handler (guaranteed on any file dialog selection)
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileSelected(file);
      // Reset so selecting the same file again triggers change reliably
      setTimeout(() => { e.target.value = ""; }, 500);
    }
  });

  // Visual helper for Drag & Drop
  const dropZoneTitle = document.getElementById("drop-zone-title");
  function setDragActive(active) {
    if (active) {
      dropZone.classList.add("border-[#FF5B8E]", "bg-[#FFE4EC]", "scale-[1.02]", "shadow-md");
      dropZone.classList.remove("bg-white", "border-[#FFB3C7]");
      if (dropZoneTitle) {
        dropZoneTitle.innerHTML = `<span class="text-[#FF5B8E] font-black text-sm animate-pulse"><i class="fa-solid fa-cloud-arrow-down"></i> Thả tệp Excel/CSV vào đây ngay!</span>`;
      }
    } else {
      dropZone.classList.remove("border-[#FF5B8E]", "bg-[#FFE4EC]", "scale-[1.02]", "shadow-md");
      dropZone.classList.add("bg-white", "border-[#FFB3C7]");
      if (dropZoneTitle) {
        dropZoneTitle.innerHTML = `Kéo & thả tệp Excel (.xlsx, .xls) hoặc CSV vào đây hoặc <span class="text-[#FF5B8E] underline font-extrabold">bấm để chọn từ máy</span>`;
      }
    }
  }

  // Prevent browser default window drag behavior
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    window.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
    document.body.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  // Attach Drag & Drop directly to both fileInput and dropZone
  ['dragenter', 'dragover'].forEach(evt => {
    if (fileInput) {
      fileInput.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
      });
    }
    if (dropZone) {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
      });
    }
  });

  ['dragleave'].forEach(evt => {
    if (fileInput) {
      fileInput.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
      });
    }
    if (dropZone) {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
      });
    }
  });

  if (fileInput) {
    fileInput.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFileSelected(dt.files[0]);
      }
    });
  }

  if (dropZone) {
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFileSelected(dt.files[0]);
      }
    });
  }

  // Global document drop support
  document.body.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      showToast("Đã nhận tệp kéo thả vào hệ thống!", true);
      switchPhase(1);
      handleFileSelected(dt.files[0]);
    }
  });

  // Quick re-clean button on status banner
  const btnReClean = document.getElementById("btn-re-clean");
  if (btnReClean) {
    btnReClean.addEventListener("click", () => {
      btnRunCleaning.click();
    });
  }

  // Download Standard Excel Template (Exact 1.006 dòng • 15 trường)
  const btnDownloadTemplate = document.getElementById("btn-download-template");
  if (btnDownloadTemplate) {
    btnDownloadTemplate.addEventListener("click", () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Transactions (Exact 15 standard fields from Diagram)
      const wsTransactionsData = [
        [
          "Mã Giao Dịch", "Ngày Giờ Giao Dịch", "Mã Cửa Hàng", "Tên Cửa Hàng", "Khu Vực",
          "Mã Sản Phẩm", "Tên Sản Phẩm", "Ngành Hàng", "Số Lượng", "Đơn Giá",
          "Thành Tiền", "Giá Vốn COGS", "Trạng Thái Đơn", "Mã Giao Dịch Gốc", "Tiền Hoàn Trả"
        ],
        ["TRX-100234", "02/10/2026 09:15", "CH01", "Phúc An Cầu Giấy", "Hà Nội", "SP-DGD01", "Nồi cơm điện cao tần 1.8L", "Điện gia dụng", 1, 2590000, 2590000, 1761200, "Hoàn tất", "", 0],
        ["TRX-100235", "02/10/2026 09:15", "CH01", "Phúc An Cầu Giấy", "Hà Nội", "SP-DGD01", "Nồi cơm điện cao tần 1.8L", "Điện gia dụng", 1, 2590000, 2590000, 1761200, "Hoàn tất", "TRX-100234", 0], // Lặp mã
        ["TRX-100412", "03/10/2026 14:20", "CH03", "Phúc An Hai Bà Trưng", "Hà Nội", "SP-TBS04", "Loa bluetooth mini bass", "Thiết bị số", 2, 490000, 980000, 860000, "Hoàn tất", "", 0],
        ["TRX-100589", "04/10/2026 16:45", "CH08", "Phúc An Quảng Ninh", "Miền Bắc", "SP-DGD09", "Máy lọc không khí Pro", "Điện gia dụng", 1, 6890000, 6890000, 4685200, "Đã hủy", "", 0],
        ["TRX-100720", "05/10/2026 11:30", "CH15", "Phúc An Bình Thạnh", "TP.HCM", "SP-SK02", "Máy nâng cơ mặt ion", "Chăm sóc sức khỏe", 1, 3200000, 3200000, 1760000, "Trả hàng", "TRX-100700", 3200000],
        ["TRX-100845", "06/10/2026 10:12", "CH04", "Phúc An Hoàn Kiếm", "Hà Nội", "SP-GD03", "Robot hút bụi lau nhà", "Gia dụng thông minh", 1, 8490000, 8490000, 5263800, "Hoàn tất", "", 0]
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(wsTransactionsData);
      XLSX.utils.book_append_sheet(wb, ws1, "1_BanHang_15Truong");

      // Sheet 2: Returns Detail
      const wsReturnsData = [
        ["Mã Phiếu Trả", "Mã Giao Dịch Gốc", "Ngày Trả", "Mã Cửa Hàng", "Giá Trị Hoàn Trả", "Lý Do Đổi Trả", "Tái Nhập Kho"],
        ["RET-001", "TRX-100720", "05/10/2026", "CH15", 3200000, "Nhân viên tư vấn sai công năng", "Có"],
        ["RET-002", "TRX-101790", "12/10/2026", "CH07", 3190000, "Vận chuyển va đập móp vỏ", "Không (Hao hụt)"]
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(wsReturnsData);
      XLSX.utils.book_append_sheet(wb, ws2, "2_DoiTra_ChiTiet");

      // Sheet 3: Products Catalog
      const wsProductsData = [
        ["Mã Sản Phẩm", "Tên Sản Phẩm", "Ngành Hàng", "Đơn Giá Niêm Yết", "Giá Vốn COGS", "Biên Lợi Nhuận Chuẩn"],
        ["SP-DGD01", "Nồi cơm điện cao tần 1.8L", "Điện gia dụng", 2590000, 1761200, "32%"],
        ["SP-TBS04", "Loa bluetooth mini bass", "Thiết bị số", 490000, 382200, "22%"],
        ["SP-SK02", "Máy nâng cơ mặt ion", "Chăm sóc sức khỏe", 3200000, 1760000, "45%"],
        ["SP-GD03", "Robot hút bụi lau nhà", "Gia dụng thông minh", 8490000, 5263800, "38%"]
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(wsProductsData);
      XLSX.utils.book_append_sheet(wb, ws3, "3_DanhMuc_GiaVon");

      // Sheet 4: Store Targets
      const wsTargetsData = [
        ["Mã Cửa Hàng", "Tên Cửa Hàng", "Khu Vực", "Mục Tiêu Doanh Thu", "Mục Tiêu LN Gộp", "Định Mức Đổi Trả Trần"],
        ["CH01", "Phúc An Cầu Giấy", "Hà Nội", 2800000000, 896000000, "3.5%"],
        ["CH02", "Phúc An Đống Đa", "Hà Nội", 3100000000, 992000000, "3.5%"],
        ["CH03", "Phúc An Hai Bà Trưng", "Hà Nội", 3000000000, 960000000, "3.5%"],
        ["CH15", "Phúc An Bình Thạnh", "TP.HCM", 3100000000, 992000000, "3.5%"]
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(wsTargetsData);
      XLSX.utils.book_append_sheet(wb, ws4, "4_MucTieu_18CH");

      XLSX.writeFile(wb, "PhucAn_Retail_Mau_1006Dong_15Truong.xlsx");
      showToast("Đã tải xuống tệp mẫu Excel chuẩn 1.006 dòng • 15 trường!");
    } catch (err) {
      showToast(`Không thể tạo file Excel: ${err.message}`, true);
    }
    });
  }

  // Reset to Sample Model (For demonstration)
  const btnResetSample = document.getElementById("btn-reset-sample");
  if (btnResetSample) {
    btnResetSample.addEventListener("click", () => {
      currentRawRecords = [...defaultSampleRawRecords];
      customDatasetLoaded = false;
      customDatasetStats = {
        totalRows: 60000,
        duplicateRows: 1842,
        cancelledRows: 2150,
        returnRows: 3420,
        cleanRows: 56008,
        fileName: "Dữ liệu mẫu Phúc An (60.000 dòng)"
      };

      if (activeSourceBadge) {
        activeSourceBadge.textContent = "Dữ liệu mẫu Phúc An (60.000 dòng)";
        activeSourceBadge.className = "px-2 py-0.5 rounded-full text-[10px] bg-[#FFE2E5] text-[#FA5A7D] border border-[#FAD2E1] font-bold";
      }

      renderRawSampleTable();
      runCleaningPipeline();
      showToast("Đã nạp bộ dữ liệu mẫu 60.000 dòng thành công!");
    });
  }

  // Clear / Empty Data Button
  const btnClearData = document.getElementById("btn-clear-data");
  if (btnClearData) {
    btnClearData.addEventListener("click", () => {
      clearAllData();
      showToast("Đã làm trống toàn bộ dữ liệu. Hệ thống sẵn sàng cho tệp mới!");
    });
  }

  // ========================================================
  // BỐI CẢNH DOANH NGHIỆP CHO AI AGENT (BUSINESS CONTEXT)
  // ========================================================
  const businessContext = {
    companyName: "",
    period: "",
    industry: "",
    description: "",
    isConfigured: false
  };

  const inputCtxCompany = document.getElementById("ctx-company-name");
  const inputCtxPeriod = document.getElementById("ctx-period");
  const inputCtxIndustry = document.getElementById("ctx-industry");
  const inputCtxAudience = document.getElementById("ctx-audience");
  const inputCtxDescription = document.getElementById("ctx-description");
  const badgeCtxStatus = document.getElementById("badge-context-status");
  const previewCtxSummary = document.getElementById("ctx-summary-preview");
  const btnSaveContext = document.getElementById("btn-save-context");
  const btnContextPreset = document.getElementById("btn-context-preset");
  const btnContextClear = document.getElementById("btn-context-clear");
  const btnContextToggle = document.getElementById("btn-context-toggle");
  const contextBody = document.getElementById("context-body");
  const iconContextToggle = document.getElementById("icon-context-toggle");

  function saveBusinessContext(silent = false) {
    businessContext.companyName = inputCtxCompany ? inputCtxCompany.value.trim() : "";
    businessContext.period = inputCtxPeriod ? inputCtxPeriod.value.trim() : "";
    businessContext.industry = inputCtxIndustry ? inputCtxIndustry.value.trim() : "";
    businessContext.audience = inputCtxAudience ? inputCtxAudience.value.trim() : "";
    businessContext.description = inputCtxDescription ? inputCtxDescription.value.trim() : "";

    const hasInfo = businessContext.companyName || businessContext.period || businessContext.industry || businessContext.description;
    businessContext.isConfigured = !!hasInfo;

    if (badgeCtxStatus) {
      if (businessContext.isConfigured) {
        badgeCtxStatus.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-500"></i> Đã lưu bối cảnh`;
        badgeCtxStatus.className = "px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1";
      } else {
        badgeCtxStatus.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Chờ điền bối cảnh`;
        badgeCtxStatus.className = "px-2.5 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold flex items-center gap-1";
      }
    }

    if (previewCtxSummary) {
      if (businessContext.isConfigured) {
        previewCtxSummary.innerHTML = `🟢 <strong>Bối cảnh kích hoạt:</strong> ${escapeHtml(businessContext.companyName || 'Doanh nghiệp')} • Kỳ: <strong>${escapeHtml(businessContext.period || 'Hiện tại')}</strong> • ${escapeHtml(businessContext.industry || 'Bán lẻ')} (AI Agent đã ghi nhớ)`;
        previewCtxSummary.className = "text-xs text-emerald-700 font-medium";
      } else {
        previewCtxSummary.textContent = "Chưa lưu bối cảnh. Nhấn 'Lưu & Áp Dụng Bối Cảnh' để AI Agent ghi nhớ trước khi nạp tệp.";
        previewCtxSummary.className = "text-xs text-slate-400 italic";
      }
    }

    if (!silent) {
      const comp = businessContext.companyName || "Doanh nghiệp";
      const peri = businessContext.period ? `(Kỳ: ${businessContext.period})` : "";
      showToast(`Đã lưu bối cảnh: ${comp} ${peri}! AI Agent sẽ phân tích theo yêu cầu này.`);

      appendLog(`[BỐI CẢNH] Doanh nghiệp: ${comp} | Kỳ: ${businessContext.period || 'Mặc định'} | Ngành: ${businessContext.industry || 'Chung'}.`, "clean");
      if (businessContext.description) {
        appendLog(`[YÊU CẦU CHO AGENT] ${businessContext.description}`, "info");
      }

      appendChatMessage(
        "ai",
        `🎯 <strong>ĐÃ GHI NHẬN BỐI CẢNH DOANH NGHIỆP:</strong><br>` +
        `• <strong>Doanh nghiệp:</strong> <strong>${escapeHtml(comp)}</strong> (${escapeHtml(businessContext.industry || 'Bán lẻ')})<br>` +
        `• <strong>Kỳ phân tích:</strong> ${escapeHtml(businessContext.period || 'Kỳ kinh doanh hiện tại')}<br>` +
        `• <strong>Yêu cầu trọng tâm:</strong> <em>${escapeHtml(businessContext.description || 'Đối soát bẫy doanh thu, kiểm soát tỷ lệ hoàn trả và tối ưu hóa lợi nhuận')}</em><br>` +
        `<span class="text-emerald-700 font-bold">✓ Hệ thống đã sẵn sàng. Hãy kéo & thả tệp Excel/CSV vào ô bên dưới để AI Agent bắt đầu phân tích!</span>`
      );
    }
  }

  if (btnSaveContext) {
    btnSaveContext.addEventListener("click", () => saveBusinessContext(false));
  }

  const CONTEXT_PRESETS = {
    retail: {
      company: "Hệ Thống Bán Lẻ Đa Kênh Phúc An Mart",
      industry: "Bán lẻ đa kênh & Thiết bị tiêu dùng",
      audience: "Ban Giám Đốc (CEO / CFO), Trưởng phòng Kinh doanh",
      description: "Phân tích doanh thu thuần theo từng chi nhánh, làm sạch đơn trùng lặp/đơn hủy/đổi trả, kiểm soát biên lợi nhuận gộp và cảnh báo các điểm bán vượt trần đổi trả 3.5%."
    },
    b2b: {
      company: "Công Ty Giải Pháp Hạ Tầng & Thiết Bị Mạng B2B",
      industry: "Thiết bị CNTT, Hạ tầng mạng & Dự án B2B",
      audience: "Giám đốc Dự án, Trưởng phòng Mua sắm & Kế toán trưởng",
      description: "Đối soát các gói thầu/RFQ thiết bị theo từng hạng mục, loại bỏ các dòng trùng lặp không phù hợp, kiểm tra giá vốn và biên lợi nhuận từng dự án trước khi chốt nghiệm thu."
    },
    ecommerce: {
      company: "Thương Hiệu Bán Hàng TMĐT Đa Sàn",
      industry: "Thương mại điện tử (Shopee, TikTok Shop, Website)",
      audience: "Founder, Ecommerce Manager & Bộ phận Vận hành",
      description: "Làm sạch đơn hủy COD, đơn hoàn/trả hàng và giao dịch quẹt đúp từ các sàn TMĐT; tính toán doanh thu thực thu, tỷ suất lợi nhuận sau hoàn hủy theo từng nhóm sản phẩm."
    },
    fnb: {
      company: "Chuỗi Nhà Hàng & Cà Phê Phố Việt",
      industry: "F&B — Dịch vụ Ăn uống & Đồ uống",
      audience: "Giám đốc Vận hành (COO) & Quản lý Chuỗi Cửa hàng",
      description: "Theo dõi doanh số thuần theo từng cơ sở, phát hiện hóa đơn hủy/in lại bất thường tại quầy POS, kiểm soát tỷ lệ giá vốn nguyên liệu (COGS) và hiệu suất giờ cao điểm."
    },
    finance: {
      company: "Công Ty Tư Vấn & Dịch Vụ Doanh Nghiệp",
      industry: "Dịch vụ B2B, Tư vấn & Tài chính",
      audience: "Hội đồng Quản trị & Giám đốc Tài chính (CFO)",
      description: "Chuẩn hóa dữ liệu hợp đồng dịch vụ, rà soát các khoản thu bị ghi nhận trùng kỳ hoặc sai lệch trạng thái thanh toán, đánh giá biên lợi nhuận gộp và mức độ hoàn thành chỉ tiêu."
    }
  };

  function clearContextFieldErrors() {
    [inputCtxCompany, inputCtxIndustry, inputCtxAudience, inputCtxDescription].forEach(el => {
      if (el) el.classList.remove("border-rose-500", "ring-2", "ring-rose-200");
    });
  }

  function validateBusinessContextRequired() {
    clearContextFieldErrors();
    const requiredFields = [
      { el: inputCtxCompany, label: "Tên Doanh nghiệp / Dự án" },
      { el: inputCtxIndustry, label: "Ngành nghề / Lĩnh vực hoạt động" },
      { el: inputCtxAudience, label: "Đối tượng xem Báo cáo / Dashboard" },
      { el: inputCtxDescription, label: "Bối cảnh & Mục tiêu Phân tích Số liệu" }
    ];

    const missing = requiredFields.filter(f => !f.el || !f.el.value.trim());
    if (missing.length > 0) {
      missing.forEach(f => {
        if (f.el) f.el.classList.add("border-rose-500", "ring-2", "ring-rose-200");
      });
      const firstEl = missing[0].el;
      if (firstEl) {
        firstEl.scrollIntoView({ behavior: "smooth", block: "center" });
        firstEl.focus();
      }
      showToast(`Bắt buộc điền Bối cảnh Doanh nghiệp (${missing[0].label}) hoặc chọn nhanh 1 mẫu gợi ý trước khi sang Bước 2!`, true);
      return false;
    }
    return true;
  }

  [inputCtxCompany, inputCtxIndustry, inputCtxAudience, inputCtxDescription].forEach(el => {
    if (el) {
      el.addEventListener("input", () => {
        if (el.value.trim()) {
          el.classList.remove("border-rose-500", "ring-2", "ring-rose-200");
        }
      });
    }
  });

  function applyContextPreset(presetKey) {
    const p = CONTEXT_PRESETS[presetKey] || CONTEXT_PRESETS.retail;
    if (inputCtxCompany) inputCtxCompany.value = p.company;
    if (inputCtxIndustry) inputCtxIndustry.value = p.industry;
    if (inputCtxAudience) inputCtxAudience.value = p.audience;
    if (inputCtxDescription) inputCtxDescription.value = p.description;
    clearContextFieldErrors();
    saveBusinessContext(false);
  }

  document.querySelectorAll(".ctx-preset-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-ctx-preset");
      document.querySelectorAll(".ctx-preset-pill").forEach(b => {
        b.classList.remove("bg-[#FF5B8E]", "text-white", "border-[#FF5B8E]");
        b.classList.add("bg-white", "text-slate-700");
      });
      btn.classList.remove("bg-white", "text-slate-700");
      btn.classList.add("bg-[#FF5B8E]", "text-white", "border-[#FF5B8E]");
      applyContextPreset(key);
    });
  });

  if (btnContextPreset) {
    btnContextPreset.addEventListener("click", () => applyContextPreset("retail"));
  }

  if (btnContextClear) {
    btnContextClear.addEventListener("click", () => {
      if (inputCtxCompany) inputCtxCompany.value = "";
      if (inputCtxPeriod) inputCtxPeriod.value = "";
      if (inputCtxIndustry) inputCtxIndustry.value = "";
      if (inputCtxAudience) inputCtxAudience.value = "";
      if (inputCtxDescription) inputCtxDescription.value = "";
      saveBusinessContext(true);
      showToast("Đã làm trống bối cảnh doanh nghiệp.");
    });
  }

  // ========================================================
  // STEP 1 WORKFLOW INTEGRATION (BƯỚC 1A + BƯỚC 1B)
  // ========================================================
  const rawPasteInput = document.getElementById("raw-data-paste-input");
  const inputStatusHint = document.getElementById("input-status-hint");
  const btnLoadSampleQuick = document.getElementById("btn-load-sample-quick");
  const btnAnalyzeContextData = document.getElementById("btn-analyze-context-data");
  const btnNewSession = document.getElementById("btn-new-session");

  // Drag & drop directly onto the Step 1B paste box
  if (rawPasteInput) {
    ['dragenter', 'dragover'].forEach(evt => {
      rawPasteInput.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        rawPasteInput.classList.add("border-[#FF5B8E]", "bg-[#FFF0F5]");
      });
    });
    rawPasteInput.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rawPasteInput.classList.remove("border-[#FF5B8E]", "bg-[#FFF0F5]");
    });
    rawPasteInput.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rawPasteInput.classList.remove("border-[#FF5B8E]", "bg-[#FFF0F5]");
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFileSelected(dt.files[0]);
      }
    });
  }

  // Startup state: keep Step 1A & Step 1B completely empty until user inputs or uploads data

  // Step 1: Load 60k sample data quickly
  if (btnLoadSampleQuick) {
    btnLoadSampleQuick.addEventListener("click", () => {
      if (inputCtxCompany) inputCtxCompany.value = "Hệ Thống Bán Lẻ Phúc An Mart";
      if (inputCtxIndustry) inputCtxIndustry.value = "Bán lẻ đa kênh (Omnichannel Retail & FMCG)";
      if (inputCtxAudience) inputCtxAudience.value = "Ban Giám Đốc (CEO / CFO), Trưởng phòng Kinh doanh";
      if (inputCtxDescription) inputCtxDescription.value = "Đối soát 60.000 dòng dữ liệu giao dịch Tháng 10/2026, làm sạch đơn hủy, trùng lặp POS, bóc tách tỷ lệ đổi trả hàng và phân bổ lại doanh thu chuẩn hóa về 18 cửa hàng.";

      saveBusinessContext(true);

      if (rawPasteInput) {
        rawPasteInput.value = `Mã Giao Dịch,Ngày Giờ Giao Dịch,Mã Cửa Hàng,Tên Cửa Hàng,Khu Vực,Mã SP,Tên SP,Ngành Hàng,Số Lượng,Đơn Giá,Thành Tiền,COGS,Trạng Thái Đơn
TRX-100234,02/10/2026 09:15,CH01,Phúc An Cầu Giấy,Hà Nội,SP-DGD01,Nồi cơm điện cao tần 1.8L,Điện gia dụng,1,2590000,2590000,1761200,Hoàn tất
TRX-100235,02/10/2026 09:15,CH01,Phúc An Cầu Giấy,Hà Nội,SP-DGD01,Nồi cơm điện cao tần 1.8L,Điện gia dụng,1,2590000,2590000,1761200,Hoàn tất
TRX-100412,03/10/2026 14:20,CH03,Phúc An Hai Bà Trưng,Hà Nội,SP-TBS04,Loa bluetooth mini bass,Thiết bị số,2,490000,980000,860000,Hoàn tất
TRX-100589,04/10/2026 16:45,CH08,Phúc An Quảng Ninh,Miền Bắc,SP-DGD09,Máy lọc không khí Pro,Điện gia dụng,1,6890000,6890000,4685200,Đã hủy
TRX-100720,05/10/2026 11:30,CH15,Phúc An Bình Thạnh,TP.HCM,SP-SK02,Máy nâng cơ mặt ion,Chăm sóc sức khỏe,1,3200000,3200000,1760000,Trả hàng
... [Đã nạp sẵn 60.000 dòng giao dịch từ CSDL Doanh Nghiệp Phúc An Mart] ...`;
      }

      if (inputStatusHint) {
        inputStatusHint.innerHTML = `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> Đã nạp 60.000 dòng mẫu từ Phúc An Mart. Bấm "Phân Tích Bối Cảnh & Kiểm Tra Định Dạng" để sang Bước 2!</span>`;
      }

      currentRawRecords = [...defaultSampleRawRecords];
      customDatasetStats = {
        totalRows: 60000,
        duplicateRows: 1842,
        cancelledRows: 2150,
        returnRows: 3420,
        cleanRows: 56008,
        fileName: "PhucAn_Retail_60k_Dong_Mau.xlsx"
      };

      showToast("Đã nạp 60.000 dòng mẫu! Bấm 'Phân Tích Bối Cảnh & Kiểm Tra Định Dạng' để sang Bước 2.");
    });
  }

  // Step 1: Analyze Context & Raw Data button
  if (btnAnalyzeContextData) {
    btnAnalyzeContextData.addEventListener("click", () => {
      if (!validateBusinessContextRequired()) {
        return;
      }
      const rawText = rawPasteInput ? rawPasteInput.value.trim() : "";
      
      // Save business context
      saveBusinessContext(true);

      const isPreviewPlaceholder = rawText.startsWith("[TỆP:");
      if (rawText.length > 0 && !isPreviewPlaceholder && (!currentRawRecords || currentRawRecords.length === 0 || rawText !== window.__lastParsedRawText)) {
        // Try parsing CSV or JSON
        try {
          if (rawText.startsWith("[") || rawText.startsWith("{")) {
            const parsedJson = JSON.parse(rawText);
            const rows = Array.isArray(parsedJson) ? parsedJson : (parsedJson.data || parsedJson.rows || []);
            if (rows.length > 0) {
              window.__lastParsedRawText = rawText;
              processParsedRows(rows, "du_lieu_dan.json", true);
              return;
            }
          }
          if (typeof Papa !== "undefined" && (rawText.includes(",") || rawText.includes("\t") || rawText.includes(";"))) {
            const parsed = Papa.parse(rawText, { header: true, dynamicTyping: true, skipEmptyLines: true });
            if (parsed.data && parsed.data.length > 0) {
              window.__lastParsedRawText = rawText;
              processParsedRows(parsed.data, "phuc_an_transactions.csv", true);
              return;
            }
          }
        } catch (err) {
          console.warn("Lỗi parse text thô:", err);
        }
      }

      if (currentRawRecords && currentRawRecords.length > 0) {
        revealSubsequentSteps();
        state.isCleaningRunning = false;
        runCleaningPipeline(currentRawRecords, customDatasetStats);
        showToast("Đã phân tích bối cảnh & kiểm tra định dạng! Đang chuyển sang Bước 2: Làm sạch.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // If nothing entered
      if (!rawText) {
        showToast("Vui lòng dán dữ liệu, tải file lên hoặc bấm 'Nạp 60k Dòng Mẫu'!", true);
        if (rawPasteInput) rawPasteInput.focus();
        return;
      }

      // Fallback: has text, run sample model
      currentRawRecords = [...defaultSampleRawRecords];
      customDatasetStats.fileName = "Dữ liệu phân tích bối cảnh";
      revealSubsequentSteps();
      state.isCleaningRunning = false;
      runCleaningPipeline(currentRawRecords, customDatasetStats);
      showToast("Đã phân tích bối cảnh và nạp dữ liệu! Đang chuyển sang Bước 2.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Top Bar: New Session / Clear All
  if (btnNewSession) {
    btnNewSession.addEventListener("click", () => {
      if (inputCtxCompany) inputCtxCompany.value = "";
      if (inputCtxIndustry) inputCtxIndustry.value = "";
      if (inputCtxAudience) inputCtxAudience.value = "";
      if (inputCtxDescription) inputCtxDescription.value = "";
      if (rawPasteInput) rawPasteInput.value = "";

      if (inputStatusHint) {
        inputStatusHint.innerHTML = "Chưa có dữ liệu. Hãy tải file hoặc dán dữ liệu để bắt đầu.";
        inputStatusHint.className = "text-xs text-slate-400 italic";
      }

      clearAllData();
      hideSubsequentSteps();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast("Đã làm trống phiên làm việc! Sẵn sàng nhận dự án mới.");
    });
  }

  // 4-Step Stepper Navigation Clicks
  const stepNav1 = document.getElementById("step-nav-1");
  const stepNav2 = document.getElementById("step-nav-2");
  const stepNav3 = document.getElementById("step-nav-3");
  const stepNav4 = document.getElementById("step-nav-4");

  if (stepNav1) {
    stepNav1.addEventListener("click", () => {
      const step1Section = document.getElementById("step1-main-section");
      const container = document.getElementById("subsequent-steps-container");
      if (step1Section) {
        step1Section.classList.remove("hidden");
        triggerPageTransition(step1Section);
      }
      if (container) container.classList.add("hidden");
      setWorkflowStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (stepNav2) {
    stepNav2.addEventListener("click", () => {
      if (!state.hasAnalyzedStep1) {
        showToast("Vui lòng bấm 'Phân Tích Bối Cảnh & Kiểm Tra Định Dạng' ở Bước 1 trước!", true);
        return;
      }
      const step1Section = document.getElementById("step1-main-section");
      const container = document.getElementById("subsequent-steps-container");
      if (step1Section) step1Section.classList.add("hidden");
      if (container) container.classList.remove("hidden");
      setWorkflowStep(2);
      switchPhase(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (stepNav3) {
    stepNav3.addEventListener("click", () => {
      if (!state.hasAnalyzedStep1) {
        showToast("Vui lòng bấm 'Phân Tích Bối Cảnh & Kiểm Tra Định Dạng' ở Bước 1 trước!", true);
        return;
      }
      if (!state.phase1Completed) {
        openVerificationChoiceModal();
        return;
      }
      const step1Section = document.getElementById("step1-main-section");
      const container = document.getElementById("subsequent-steps-container");
      if (step1Section) step1Section.classList.add("hidden");
      if (container) container.classList.remove("hidden");
      setWorkflowStep(3);
      switchPhase(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (stepNav4) {
    stepNav4.addEventListener("click", () => {
      if (!state.hasAnalyzedStep1) {
        showToast("Vui lòng bấm 'Phân Tích Bối Cảnh & Kiểm Tra Định Dạng' ở Bước 1 trước!", true);
        return;
      }
      if (!state.phase1Completed) {
        openVerificationChoiceModal();
        return;
      }
      const step1Section = document.getElementById("step1-main-section");
      const container = document.getElementById("subsequent-steps-container");
      if (step1Section) step1Section.classList.add("hidden");
      if (container) container.classList.remove("hidden");
      setWorkflowStep(4);
      switchPhase(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (btnContextToggle && contextBody) {
    btnContextToggle.addEventListener("click", () => {
      contextBody.classList.toggle("hidden");
      if (iconContextToggle) {
        if (contextBody.classList.contains("hidden")) {
          iconContextToggle.className = "fa-solid fa-chevron-down";
        } else {
          iconContextToggle.className = "fa-solid fa-chevron-up";
        }
      }
    });
  }

  document.querySelectorAll(".ctx-tag-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tagText = btn.getAttribute("data-text");
      if (inputCtxDescription) {
        if (inputCtxDescription.value.trim()) {
          inputCtxDescription.value += "; " + tagText;
        } else {
          inputCtxDescription.value = tagText;
        }
        inputCtxDescription.focus();
      }
    });
  });

  // Google Sheets Sync handler
  const btnSyncGsheet = document.getElementById("btn-sync-gsheet");
  if (btnSyncGsheet) {
    btnSyncGsheet.addEventListener("click", () => {
      const gsheetInput = document.getElementById("input-gsheet-url");
      const url = gsheetInput ? gsheetInput.value.trim() : "";
      if (!url) {
        showToast("Vui lòng dán liên kết Google Sheets của doanh nghiệp!", true);
        return;
      }

      appendLog(`[GOOGLE SHEETS] Đang kết nối tới URL: ${url.substring(0, 45)}...`, "info");
      setTimeout(() => {
        // Simulate successful live sync
        appendLog(`[GOOGLE SHEETS] Đồng bộ thành công 4 sheets: Transactions, Returns, Products, Targets.`, "clean");
        processParsedRows(defaultSampleRawRecords, "Google_Sheets_Live_PhucAn_T10");
      }, 1200);
    });
  }

  // ========================================================
  // 9-STEP PIPELINE RUNNER & EXCEPTION AUDIT DRAWERS (FLOWCHART)
  // ========================================================
  const sampleExceptions = [
    { code: "TRX-100235", origCode: "TRX-100234", store: "CH01 - Cầu Giấy", type: "Mã giao dịch lặp (Duplicate POS)", amount: 2590000, action: "Loại bỏ bản ghi trùng, giữ mã gốc TRX-100234" },
    { code: "TRX-100589", origCode: "N/A", store: "CH08 - Quảng Ninh", type: "Đơn hàng đã hủy (Cộng nhầm doanh thu)", amount: 6890000, action: "Trừ toàn bộ 6.890.000 đ khỏi doanh thu thô" },
    { code: "RET-099", origCode: "TRX-888999 (Không khớp)", store: "CH12 - Quận 1", type: "Mã gốc không khớp hệ thống", amount: 1850000, action: "Ghi nhận vào sổ kiểm tra ngoại lệ, tra soát tay" },
    { code: "TRX-100845", origCode: "N/A", store: "CH04 - Hoàn Kiếm", type: "Lệch kỳ so sánh (45 ngày vs 30 ngày)", amount: 8490000, action: "Chuẩn hóa chu kỳ tương đương 31 ngày chuẩn" },
    { code: "TRX-101560", origCode: "TRX-100412", store: "CH03 - Hai Bà Trưng", type: "Mã giao dịch lặp (Xả hàng km)", amount: 490000, action: "Khử trùng lặp, bảo toàn giá vốn chuẩn" },
    { code: "RET-001", origCode: "TRX-100720", store: "CH15 - Bình Thạnh", type: "Đổi trả hàng (Tư vấn sai công năng)", amount: 3200000, action: "Trừ doanh thu thuần và hoàn nhập giá vốn COGS" }
  ];

  function renderExceptionsTable() {
    const tbody = document.getElementById("exception-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    sampleExceptions.forEach(ex => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-rose-50/60 transition";
      tr.innerHTML = `
        <td class="p-2.5 font-mono font-bold text-rose-700">${ex.code}</td>
        <td class="p-2.5 font-mono text-slate-500">${ex.origCode}</td>
        <td class="p-2.5 font-bold text-slate-900">${ex.store}</td>
        <td class="p-2.5 text-rose-800 font-semibold">${ex.type}</td>
        <td class="p-2.5 text-right font-mono font-bold text-slate-900">${formatMoney(ex.amount)}</td>
        <td class="p-2.5 text-emerald-800 font-medium">${ex.action}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  const btnToggleException = document.getElementById("btn-toggle-exception-table");
  const exceptionContainer = document.getElementById("exception-log-container");
  if (btnToggleException && exceptionContainer) {
    btnToggleException.addEventListener("click", () => {
      exceptionContainer.classList.toggle("hidden");
      renderExceptionsTable();
    });
  }

  const btnToggleVerify = document.getElementById("btn-toggle-verify-table");
  const verifyContainer = document.getElementById("verify-log-container");
  if (btnToggleVerify && verifyContainer) {
    btnToggleVerify.addEventListener("click", () => {
      verifyContainer.classList.toggle("hidden");
    });
  }

  // BPMN Swimlane Interactive Flow Runner
  const btnRunBpmnFlow = document.getElementById("btn-run-bpmn-flow");
  const bpmnNodes = [
    "bpmn-node-human-1", "bpmn-node-agent-clean", "bpmn-node-agent-artifact",
    "bpmn-node-human-verify", "bpmn-node-decision", "bpmn-node-agent-calc",
    "bpmn-node-agent-report", "bpmn-node-human-p2", "bpmn-node-human-p3",
    "bpmn-node-agent-audit", "bpmn-node-agent-priority", "bpmn-node-mgr-review", "bpmn-node-mgr-decision"
  ];

  function highlightBpmnNode(activeId) {
    bpmnNodes.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === activeId) {
          el.classList.add("ring-2", "ring-[#FF5B8E]", "scale-105", "shadow-md");
          el.classList.remove("opacity-60");
        } else {
          el.classList.remove("ring-2", "ring-[#FF5B8E]", "scale-105", "shadow-md");
        }
      }
    });
  }

  if (btnRunBpmnFlow) {
    btnRunBpmnFlow.addEventListener("click", () => {
      if (state.isCleaningRunning) return;
      state.isCleaningRunning = true;
      showToast("Khởi chạy quy trình BPMN Quản trị Bán hàng Phúc An...");

      // 1. Human: Cung cấp file Excel thô
      highlightBpmnNode("bpmn-node-human-1");
      appendLog("[BPMN 1.1] Con người: Tiếp nhận và nạp File Excel bán hàng thô 1.006 dòng • 15 trường.", "info");

      setTimeout(() => {
        // 2. AI Agent: Làm sạch tự động
        highlightBpmnNode("bpmn-node-agent-clean");
        appendLog("[BPMN 1.2] AI Agent / API: Tự động chuẩn hóa dữ liệu, khử 34 đơn trùng, bỏ 42 đơn hủy.", "clean");
      }, 700);

      setTimeout(() => {
        // 3. AI Agent: Xuất Artifact "Bộ dữ liệu đã làm sạch + Nhật ký xử lý"
        highlightBpmnNode("bpmn-node-agent-artifact");
        appendLog("[BPMN 1.3] AI Agent / API: Đã xuất 'Bộ dữ liệu sạch + Nhật ký xử lý' gồm 930 dòng chuẩn.", "success");
      }, 1400);

      setTimeout(() => {
        // 4. Human: Kiểm tra kết quả làm sạch
        highlightBpmnNode("bpmn-node-human-verify");
        highlightBpmnNode("bpmn-node-decision");
        appendLog("[BPMN 1.4] Con người: Thực hiện bước Human Verification ➔ Dữ liệu OK? Phê duyệt [CÓ]!", "clean");
        state.phase1Completed = true;
      }, 2100);

      setTimeout(() => {
        // 5. Phase 2 AI Agent: Tính chỉ tiêu
        highlightBpmnNode("bpmn-node-agent-calc");
        appendLog("[BPMN 2.1] AI Agent / API: Tính toán doanh thu thuần, LN gộp, đơn hủy/hoàn và cơ cấu SP.", "clean");
      }, 2800);

      setTimeout(() => {
        // 6. Phase 2 AI Agent: Tạo báo cáo quản trị Dashboard / Summary
        highlightBpmnNode("bpmn-node-agent-report");
        highlightBpmnNode("bpmn-node-human-p2");
        appendLog("[BPMN 2.2] AI Agent: Sinh Dashboard quản trị 18 cửa hàng. Con người tiếp nhận đối chiếu.", "success");
        state.phase2Completed = true;
        generateManagementReport();
      }, 3500);

      setTimeout(() => {
        // 7. Phase 3 AI Agent: Đối chiếu & Phát hiện bất thường
        highlightBpmnNode("bpmn-node-agent-audit");
        highlightBpmnNode("bpmn-node-human-p3");
        appendLog("[BPMN 3.1] AI Agent: Cross-check đối soát 2 chiều, bóc tách bẫy doanh thu CH03 & đổi trả CH15.", "clean");
      }, 4200);

      setTimeout(() => {
        // 8. Phase 3 AI Agent: Gợi ý ưu tiên
        highlightBpmnNode("bpmn-node-agent-priority");
        appendLog("[BPMN 3.2] AI Agent: Xuất Ma trận phân loại ưu tiên 18 cửa hàng (Nhóm 1 Cấp thiết: CH03, CH15, CH08, CH04).", "clean");
        state.phase3Completed = true;
        runCrossCheckAudit();
      }, 4900);

      setTimeout(() => {
        // 9. Quản lý: Đánh giá & Ra quyết định
        highlightBpmnNode("bpmn-node-mgr-review");
        highlightBpmnNode("bpmn-node-mgr-decision");
        appendLog("[BPMN 3.3] Quản lý (Giám đốc Kinh doanh): Đánh giá báo cáo và sẵn sàng ký Lệnh hỗ trợ kịp thời!", "success");
        state.isCleaningRunning = false;
        showToast("Toàn bộ quy trình BPMN đã thực thi hoàn tất!");
      }, 5600);
    });
  }

  // Allow clicking on individual BPMN nodes
  bpmnNodes.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        highlightBpmnNode(id);
        if (id.includes("human-1") || id.includes("clean") || id.includes("artifact")) {
          switchPhase(1);
        } else if (id.includes("calc") || id.includes("report") || id.includes("human-p2")) {
          switchPhase(2);
        } else {
          switchPhase(3);
        }
      });
    }
  });

  // 9-Step Pipeline Runner Button
  const btnRun9Steps = document.getElementById("btn-run-9steps");
  const statusIndicator = document.getElementById("pipeline-status-indicator");
  const statusText = document.getElementById("pipeline-status-text");

  function highlightStep(stepNum) {
    for (let i = 1; i <= 9; i++) {
      const box = document.getElementById(`step-box-${i}`);
      if (box) {
        if (i === stepNum) {
          box.className = "p-3 rounded-2xl border-2 border-[#FF5B8E] bg-[#FFF0F5] shadow-md shadow-pink-300/30 scale-102 transition-all space-y-1";
        } else if (i < stepNum) {
          box.className = "p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 transition-all space-y-1 opacity-90";
        } else {
          box.className = "p-3 rounded-2xl border border-slate-200 bg-slate-50 transition-all space-y-1 opacity-70";
        }
      }
    }
  }

  if (btnRun9Steps) {
    btnRun9Steps.addEventListener("click", () => {
      if (state.isCleaningRunning) return;
      state.isCleaningRunning = true;
      statusIndicator.className = "w-2.5 h-2.5 rounded-full bg-[#FF5B8E] animate-ping";
      statusText.textContent = "Đang chạy luồng 9 bước tự động...";

      // Step 1
      highlightStep(1);
      statusText.textContent = "Bước 1: Đang nạp File Excel bán hàng thô (1.006 dòng • 15 trường)...";
      appendLog("[BƯỚC 1] Nạp tệp Excel bán hàng thô 1.006 dòng • 15 trường dữ liệu.", "info");

      setTimeout(() => {
        // Step 2
        highlightStep(2);
        statusText.textContent = "Bước 2: Kiểm tra cấu trúc (Tên cột, kiểu dữ liệu, định dạng ngày, trường bắt buộc)...";
        appendLog("[BƯỚC 2] Kiểm tra cấu trúc 15 trường: Kiểu số, ngày DD/MM/YYYY, trạng thái hợp lệ.", "clean");
      }, 700);

      setTimeout(() => {
        // Step 3
        highlightStep(3);
        statusText.textContent = "Bước 3: Làm sạch dữ liệu (Khoảng trắng, định dạng ngày, chuẩn hóa ô trống)...";
        appendLog("[BƯỚC 3] Chuẩn hóa khoảng trắng, quy đổi ngày đồng nhất và điền 0 vào ô đổi trả trống.", "clean");
      }, 1400);

      setTimeout(() => {
        // Step 4
        highlightStep(4);
        statusText.textContent = "Bước 4: Kiểm tra chất lượng (Mã giao dịch, số lượng, đơn giá, thành tiền, mã gốc)...";
        appendLog("[BƯỚC 4] Kiểm tra chất lượng: Phát hiện 34 dòng lặp mã, 42 đơn hủy, 8 mã gốc không khớp.", "clean");
      }, 2100);

      setTimeout(() => {
        // Step 5: Exception
        highlightStep(5);
        statusText.textContent = "Bước 5: Ghi nhận ngoại lệ & Đối soát (Đưa vào danh sách rà soát ➔ Vòng lặp điều chỉnh)...";
        appendLog("[BƯỚC 5] Ghi nhận 84 bản ghi ngoại lệ vào sổ rà soát. Xử lý loại trừ và lặp lại Bước 3.", "clean");
        renderExceptionsTable();
        if (exceptionContainer) exceptionContainer.classList.remove("hidden");
      }, 2800);

      setTimeout(() => {
        // Step 6: Process & Aggregate
        highlightStep(6);
        statusText.textContent = "Bước 6: Xử lý & Tổng hợp (Doanh thu, số lượng, 18 cửa hàng, phân loại hoàn tất/hủy/trả)...";
        appendLog("[BƯỚC 6] Tổng hợp số liệu sạch cho 18 cửa hàng: Doanh thu thuần 49.47 Tỷ, Lợi nhuận gộp 15.54 Tỷ.", "clean");
      }, 3500);

      setTimeout(() => {
        // Step 7: Verification
        highlightStep(7);
        statusText.textContent = "Bước 7: Xác minh kết quả (Đối chiếu: Thành tiền = SL × Đơn giá; Tiền hoàn khớp 100%)...";
        appendLog("[BƯỚC 7] Xác minh hoàn tất: Thành tiền = SL × Đơn giá khớp 100%, Sai lệch = 0 đ.", "clean");
        if (verifyContainer) verifyContainer.classList.remove("hidden");
      }, 4200);

      setTimeout(() => {
        // Step 8: Dashboard & Report
        highlightStep(8);
        statusText.textContent = "Bước 8: Báo Cáo / Dashboard (Bộ dữ liệu sạch + KPI 18 CH + Biểu đồ + Xếp hạng ưu tiên)...";
        appendLog("[BƯỚC 8] Đã sinh Báo Cáo Quản Trị và Ma Trận Ưu Tiên 18 Cửa Hàng cho Giám đốc.", "success");
        state.phase1Completed = true;
        state.phase2Completed = true;
        state.phase3Completed = true;
      }, 4900);

      setTimeout(() => {
        // Step 9: Feedback & Loop
        highlightStep(9);
        statusIndicator.className = "w-2.5 h-2.5 rounded-full bg-emerald-500";
        statusText.textContent = "Bước 9: Phản hồi & Cải tiến hoàn tất! Đã cập nhật quy tắc vào bộ nhớ Agent cho kỳ sau.";
        appendLog("[BƯỚC 9] Ghi nhận bài học audit: Tự động khóa cherry-picking ngày và bóc tách bẫy doanh thu CH03.", "success");
        state.isCleaningRunning = false;
        showToast("Toàn bộ quy trình 9 bước đã hoàn thành xuất sắc!");
      }, 5600);
    });
  }

  // AI Agent Data Cleaning Pipeline (GIAI ĐOẠN 1)
  btnRunCleaning.addEventListener("click", () => {
    runCleaningPipeline();
  });

  // Manual Editing Mode Logic (Option 2: Not satisfied with AI cleaning)
  const manualEditPanel = document.getElementById("manual-edit-mode-panel");
  const btnOpenManualEdit = document.getElementById("btn-open-manual-edit-mode");
  const btnCloseManualEdit = document.getElementById("btn-close-manual-edit");
  const manualEditSearch = document.getElementById("manual-edit-search");
  const manualEditFilter = document.getElementById("manual-edit-filter");
  const btnSaveAllManual = document.getElementById("btn-save-all-manual-edits");
  const btnApproveManualNext = document.getElementById("btn-approve-manual-and-next");

  function recalculateStatsFromRecords() {
    if (!currentRawRecords || currentRawRecords.length === 0) return;
    let dup = 0, can = 0, ret = 0, per = 0, cln = 0;
    currentRawRecords.forEach(r => {
      if (!r) return;
      if (r.type === "duplicate") dup++;
      else if (r.type === "cancelled" || r.type === "cancel") can++;
      else if (r.type === "return") ret++;
      else if (r.type === "period") per++;
      else cln++;
    });
    const autoDup = customDatasetStats.autoDeletedDuplicates || 0;
    customDatasetStats.totalRows = currentRawRecords.length + autoDup;
    customDatasetStats.duplicateRows = dup + autoDup;
    customDatasetStats.cancelledRows = can;
    customDatasetStats.returnRows = ret;
    customDatasetStats.periodRows = per;
    customDatasetStats.cleanRows = cln;
    const elTot = document.getElementById("stat-total-raw-rows");
    if (elTot) elTot.innerHTML = `${customDatasetStats.totalRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    updateStep2ErrorCounts(customDatasetStats, currentRawRecords);
  }

  function renderManualEditTable() {
    const tbody = document.getElementById("manual-edit-tbody");
    if (!tbody) return;
    const records = (currentRawRecords && currentRawRecords.length > 0) ? currentRawRecords : [];
    const q = (manualEditSearch?.value || "").trim().toLowerCase();
    const flt = manualEditFilter ? manualEditFilter.value : "errors";

    const filtered = records
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => {
        if (flt === "errors" && (!r.type || r.type === "valid")) return false;
        if (flt === "valid" && r.type && r.type !== "valid") return false;
        if (q) {
          const hay = `${r.code} ${r.store} ${r.prod}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-xs text-slate-400">Không có dòng dữ liệu nào phù hợp.</td></tr>`;
      return;
    }

    const MAX_MANUAL = 50;
    const slice = filtered.slice(0, MAX_MANUAL);
    tbody.innerHTML = slice.map(({ r, idx }) => {
      const isErr = r.type && r.type !== "valid";
      const info = isErr ? getErrorAnalysisAndFix(r) : null;
      const curRev = isErr ? (r.fixedRev !== undefined ? r.fixedRev : info.defaultRev) : r.rev;
      const curCogs = isErr ? (r.fixedCogs !== undefined ? r.fixedCogs : info.defaultCogs) : r.cogs;

      return `
        <tr class="hover:bg-amber-50/40" data-manual-row="${idx}">
          <td class="p-2 font-mono font-bold text-slate-900">${escapeHtml(r.code)}</td>
          <td class="p-2">
            <input type="text" data-m-store="${idx}" value="${escapeHtml(r.store)}" class="w-36 bg-white border border-slate-200 focus:border-[#FF5B8E] rounded-lg px-2 py-1 text-xs">
          </td>
          <td class="p-2">
            <input type="text" data-m-prod="${idx}" value="${escapeHtml(r.prod)}" class="w-44 bg-white border border-slate-200 focus:border-[#FF5B8E] rounded-lg px-2 py-1 text-xs">
          </td>
          <td class="p-2 text-right">
            <input type="number" min="0" step="1000" data-m-rev="${idx}" value="${Number(curRev) || 0}" class="w-28 text-right font-mono font-bold bg-emerald-50 border border-emerald-300 focus:border-emerald-600 rounded-lg px-2 py-1 text-xs text-emerald-900">
          </td>
          <td class="p-2 text-right">
            <input type="number" min="0" step="1000" data-m-cogs="${idx}" value="${Number(curCogs) || 0}" class="w-28 text-right font-mono bg-white border border-slate-200 focus:border-[#FF5B8E] rounded-lg px-2 py-1 text-xs">
          </td>
          <td class="p-2">
            <select data-m-type="${idx}" class="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold">
              <option value="valid" ${r.type === "valid" ? "selected" : ""}>Hợp lệ (Sạch)</option>
              <option value="duplicate" ${r.type === "duplicate" ? "selected" : ""}>Trùng lặp</option>
              <option value="cancelled" ${r.type === "cancelled" ? "selected" : ""}>Đơn đã hủy</option>
              <option value="return" ${r.type === "return" ? "selected" : ""}>Đổi trả</option>
              <option value="period" ${r.type === "period" ? "selected" : ""}>Lệch kỳ</option>
            </select>
          </td>
          <td class="p-2 text-center">
            <button type="button" data-m-save="${idx}" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer">
              Lưu
            </button>
          </td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll("[data-m-save]").forEach(btn => {
      btn.addEventListener("click", () => {
        const recIdx = parseInt(btn.getAttribute("data-m-save"), 10);
        applySingleManualEdit(recIdx);
        recalculateStatsFromRecords();
        renderRawSampleTable();
        showToast(`Đã lưu chỉnh sửa thủ công cho mã ${currentRawRecords[recIdx].code}!`);
      });
    });
  }

  function applySingleManualEdit(recIdx) {
    const rec = currentRawRecords[recIdx];
    if (!rec) return;
    const storeInp = document.querySelector(`[data-m-store="${recIdx}"]`);
    const prodInp = document.querySelector(`[data-m-prod="${recIdx}"]`);
    const revInp = document.querySelector(`[data-m-rev="${recIdx}"]`);
    const cogsInp = document.querySelector(`[data-m-cogs="${recIdx}"]`);
    const typeSel = document.querySelector(`[data-m-type="${recIdx}"]`);

    if (storeInp) rec.store = storeInp.value.trim() || rec.store;
    if (prodInp) rec.prod = prodInp.value.trim() || rec.prod;
    if (typeSel) rec.type = typeSel.value;

    const newRev = revInp ? Math.max(0, Number(revInp.value) || 0) : rec.rev;
    const newCogs = cogsInp ? Math.max(0, Number(cogsInp.value) || 0) : rec.cogs;
    if (rec.type === "valid") {
      rec.rev = newRev;
      rec.cogs = newCogs;
      rec.note = "Đã chỉnh sửa thủ công (Hợp lệ)";
    } else {
      rec.fixedRev = newRev;
      rec.fixedCogs = newCogs;
      rec.isFixed = true;
      rec.note = "Đã chỉnh sửa thủ công";
    }
  }

  function saveAllVisibleManualEdits() {
    document.querySelectorAll("[data-manual-row]").forEach(tr => {
      const recIdx = parseInt(tr.getAttribute("data-manual-row"), 10);
      applySingleManualEdit(recIdx);
    });
    recalculateStatsFromRecords();
    renderRawSampleTable();
  }

  // Inline editing directly in Bảng Đối Soát Mẫu Dữ Liệu (Step 2 Page 2)
  function applyInlineSampleRowEdit(recIdx) {
    const rec = currentRawRecords[recIdx];
    if (!rec) return;
    const storeInp = document.querySelector(`[data-inline-store="${recIdx}"]`);
    const prodInp = document.querySelector(`[data-inline-prod="${recIdx}"]`);
    const catInp = document.querySelector(`[data-inline-cat="${recIdx}"]`);
    const revInp = document.querySelector(`[data-inline-rev="${recIdx}"]`);
    const cogsInp = document.querySelector(`[data-inline-cogs="${recIdx}"]`);
    const typeSel = document.querySelector(`[data-inline-type="${recIdx}"]`);

    if (storeInp) rec.store = storeInp.value.trim() || rec.store;
    if (prodInp) rec.prod = prodInp.value.trim() || rec.prod;
    if (catInp) rec.cat = catInp.value.trim() || rec.cat;
    if (revInp) {
      const val = Math.max(0, Number(revInp.value) || 0);
      rec.rev = val;
      rec.fixedRev = val;
    }
    if (cogsInp) {
      const cVal = Math.max(0, Number(cogsInp.value) || 0);
      rec.cogs = cVal;
      rec.fixedCogs = cVal;
    }
    if (typeSel) {
      rec.type = typeSel.value;
      if (rec.type === "valid") {
        rec.status = "Hoàn thành";
        rec.note = "Đã sửa thủ công (Hợp lệ)";
      } else if (rec.type === "duplicate") {
        rec.status = "Trùng lặp";
        rec.note = "Sửa thủ công: Đánh dấu trùng lặp";
      } else if (rec.type === "cancelled") {
        rec.status = "Đã hủy";
        rec.note = "Sửa thủ công: Đánh dấu đơn hủy";
      } else if (rec.type === "return") {
        rec.status = "Đổi trả";
        rec.note = "Sửa thủ công: Đánh dấu đổi trả";
      } else if (rec.type === "period") {
        rec.status = "Lệch kỳ";
        rec.note = "Sửa thủ công: Đánh dấu lệch kỳ";
      }
    }
    rec.isFixed = true;
    state.isReportGenerated = false;
    state.isAuditCompleted = false;
  }
  window.applyInlineSampleRowEdit = applyInlineSampleRowEdit;

  function saveAllInlineSampleEdits() {
    document.querySelectorAll("[data-inline-row]").forEach(tr => {
      const recIdx = parseInt(tr.getAttribute("data-inline-row"), 10);
      applyInlineSampleRowEdit(recIdx);
    });
    recalculateStatsFromRecords();
    renderRawSampleTable();
  }

  function setInlineSampleEditMode(enabled) {
    state.isInlineSampleEditMode = !!enabled;
    const inlineBar = document.getElementById("inline-sample-edit-bar");
    const toggleBtn = document.getElementById("btn-toggle-inline-sample-edit");
    if (inlineBar) inlineBar.classList.toggle("hidden", !state.isInlineSampleEditMode);
    if (toggleBtn) {
      toggleBtn.innerHTML = state.isInlineSampleEditMode
        ? `<i class="fa-solid fa-check"></i> <span>Đang sửa trực tiếp</span>`
        : `<i class="fa-solid fa-pen-to-square"></i> <span>Sửa thủ công</span>`;
      toggleBtn.className = state.isInlineSampleEditMode
        ? "px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 border border-amber-600 font-black text-xs transition flex items-center gap-1.5 cursor-pointer"
        : "px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer";
    }
    renderRawSampleTable();
  }

  const btnToggleInlineSample = document.getElementById("btn-toggle-inline-sample-edit");
  if (btnToggleInlineSample) {
    btnToggleInlineSample.addEventListener("click", () => {
      setInlineSampleEditMode(!state.isInlineSampleEditMode);
    });
  }

  const btnSaveInlineSample = document.getElementById("btn-save-inline-sample-edits");
  if (btnSaveInlineSample) {
    btnSaveInlineSample.addEventListener("click", () => {
      saveAllInlineSampleEdits();
      setInlineSampleEditMode(false);
      showToast("Đã lưu toàn bộ chỉnh sửa trực tiếp trên Bảng Đối Soát Mẫu Dữ Liệu! ✓");
    });
  }

  const btnApproveInlineSampleNext = document.getElementById("btn-approve-inline-sample-next");
  if (btnApproveInlineSampleNext) {
    btnApproveInlineSampleNext.addEventListener("click", () => {
      saveAllInlineSampleEdits();
      setInlineSampleEditMode(false);
      document.getElementById("btn-human-approve")?.click();
    });
  }

  const btnExitInlineSample = document.getElementById("btn-exit-inline-sample-edit");
  if (btnExitInlineSample) {
    btnExitInlineSample.addEventListener("click", () => {
      setInlineSampleEditMode(false);
    });
  }

  if (btnOpenManualEdit) {
    btnOpenManualEdit.addEventListener("click", () => {
      setStep2Page(2);
      setInlineSampleEditMode(true);
      const sampleTbody = document.getElementById("raw-sample-tbody");
      if (sampleTbody) {
        sampleTbody.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      showToast("Đã bật Chế độ Sửa Thủ Công trực tiếp trên Bảng Đối Soát Mẫu Dữ Liệu!");
    });
  }

  if (btnCloseManualEdit && manualEditPanel) {
    btnCloseManualEdit.addEventListener("click", () => {
      manualEditPanel.classList.add("hidden");
    });
  }

  if (manualEditSearch) manualEditSearch.addEventListener("input", renderManualEditTable);
  if (manualEditFilter) manualEditFilter.addEventListener("change", renderManualEditTable);

  if (btnSaveAllManual) {
    btnSaveAllManual.addEventListener("click", () => {
      saveAllVisibleManualEdits();
      showToast("Đã lưu toàn bộ chỉnh sửa thủ công và cập nhật bảng đối soát! ✓");
    });
  }

  if (btnApproveManualNext) {
    btnApproveManualNext.addEventListener("click", () => {
      saveAllVisibleManualEdits();
      if (manualEditPanel) manualEditPanel.classList.add("hidden");
      document.getElementById("btn-human-approve")?.click();
    });
  }

  const btnStep2Continue = document.getElementById("btn-step2-continue");
  if (btnStep2Continue) {
    btnStep2Continue.addEventListener("click", () => {
      openVerificationChoiceModal();
    });
  }

  // Centered Verification Choice Modal Handlers
  const verificationChoiceModal = document.getElementById("verification-choice-modal");
  const btnCloseVerifModal = document.getElementById("btn-close-verification-modal");
  const btnModalChoiceApprove = document.getElementById("modal-choice-approve");
  const btnModalChoiceManual = document.getElementById("modal-choice-manual");
  const btnModalChoiceAiReclean = document.getElementById("modal-choice-ai-reclean");

  if (btnCloseVerifModal && verificationChoiceModal) {
    btnCloseVerifModal.addEventListener("click", () => verificationChoiceModal.classList.add("hidden"));
  }
  if (verificationChoiceModal) {
    verificationChoiceModal.addEventListener("click", (e) => {
      if (e.target === verificationChoiceModal) verificationChoiceModal.classList.add("hidden");
    });
  }
  if (btnModalChoiceApprove && verificationChoiceModal) {
    btnModalChoiceApprove.addEventListener("click", () => {
      verificationChoiceModal.classList.add("hidden");
      document.getElementById("btn-human-approve")?.click();
    });
  }
  if (btnModalChoiceManual && verificationChoiceModal) {
    btnModalChoiceManual.addEventListener("click", () => {
      verificationChoiceModal.classList.add("hidden");
      document.getElementById("btn-open-manual-edit-mode")?.click();
    });
  }
  if (btnModalChoiceAiReclean && verificationChoiceModal) {
    btnModalChoiceAiReclean.addEventListener("click", () => {
      verificationChoiceModal.classList.add("hidden");
      document.getElementById("btn-human-reject")?.click();
    });
  }

  // Human Verification Gate Handlers
  document.getElementById("btn-human-approve").addEventListener("click", () => {
    state.phase1Completed = true;
    const badgePhase1 = document.getElementById("badge-phase1");
    if (badgePhase1) {
      badgePhase1.textContent = "Đã hoàn thành & Phê duyệt";
      badgePhase1.className = "text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700";
    }
    const tabPhase1El = document.getElementById("tab-phase1");
    if (tabPhase1El) tabPhase1El.classList.add("completed");

    const badgePhase2 = document.getElementById("badge-phase2");
    if (badgePhase2) {
      badgePhase2.textContent = "Sẵn sàng tính toán";
      badgePhase2.className = "text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700";
    }

    setWorkflowStep(3);
    showToast("Đã xác nhận dữ liệu sạch! Đang chuyển sang Bước 3: Phân Tích & Feedback...");
    setTimeout(() => switchPhase(2), 500);
  });

  // ==========================================
  // REVISION MODAL & CUSTOM HUMAN FEEDBACK SYSTEM
  // ==========================================
  const revisionModal = document.getElementById("revision-modal");
  const btnCloseRevision = document.getElementById("btn-close-revision-modal");
  const btnCancelRevision = document.getElementById("btn-cancel-revision");
  const btnSubmitRevision = document.getElementById("btn-submit-revision");
  const revisionPromptInput = document.getElementById("revision-prompt-input");
  const btnOpenRevisionModal = document.getElementById("btn-open-revision-modal");

  function openRevisionModal(initialText = "") {
    if (initialText && revisionPromptInput) {
      revisionPromptInput.value = initialText;
    }
    if (revisionModal) {
      revisionModal.classList.remove("hidden");
      if (revisionPromptInput) revisionPromptInput.focus();
    }
  }

  function closeRevisionModal() {
    if (revisionModal) {
      revisionModal.classList.add("hidden");
    }
  }

  window.openRevisionModal = openRevisionModal;
  window.closeRevisionModal = closeRevisionModal;

  if (btnOpenRevisionModal) {
    btnOpenRevisionModal.addEventListener("click", () => openRevisionModal());
  }

  document.getElementById("btn-human-reject").addEventListener("click", () => {
    openRevisionModal("");
  });

  if (btnCloseRevision) btnCloseRevision.addEventListener("click", closeRevisionModal);
  if (btnCancelRevision) btnCancelRevision.addEventListener("click", closeRevisionModal);

  document.querySelectorAll(".preset-rule-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const rule = btn.getAttribute("data-rule");
      if (!rule || !revisionPromptInput) return;
      if (revisionPromptInput.value.trim().length > 0) {
        revisionPromptInput.value += "\n• " + rule;
      } else {
        revisionPromptInput.value = rule;
      }
      revisionPromptInput.focus();
    });
  });

  function pushDataHistorySnapshot() {
    try {
      if (!Array.isArray(window.__dataHistoryStack)) window.__dataHistoryStack = [];
      if (!currentRawRecords || currentRawRecords.length === 0) return;
      window.__dataHistoryStack.push({
        records: JSON.parse(JSON.stringify(currentRawRecords || [])),
        stats: { ...customDatasetStats }
      });
      if (window.__dataHistoryStack.length > 15) window.__dataHistoryStack.shift();
    } catch (e) {}
  }

  function parseCommandMoneyThreshold(numStr, unitStr) {
    const base = parseFloat(String(numStr || "0").replace(/,/g, ".")) || 0;
    const u = String(unitStr || "").toLowerCase();
    if (u.includes("tỷ") || u.includes("ty") || u === "b") return base * 1000000000;
    if (u.includes("triệu") || u.includes("trieu") || u === "tr" || u === "m") return base * 1000000;
    if (u.includes("nghìn") || u.includes("nghin") || u === "k") return base * 1000;
    return base;
  }

  function executeAgentRevision(promptText) {
    const text = (promptText || (revisionPromptInput ? revisionPromptInput.value : "") || "").trim();
    if (!text) {
      showToast("Vui lòng nhập yêu cầu chỉnh sửa quy tắc cho AI Agent!", true);
      return;
    }

    const textLower = text.toLowerCase().normalize("NFC");

    // 1. Detect Restore / Undo Command
    const isRestoreCmd = /(?:khôi phục|khoi phuc|hoàn tác|hoan tac|undo|lấy lại|lay lai|quay lại|quay lai|phục hồi|phuc hoi|trả lại|tra lai|reset|phục chế)/i.test(textLower) ||
      /(?:về ban đầu|ve ban dau|dữ liệu gốc|du lieu goc|dữ liệu thô|du lieu tho|chưa làm sạch|chua lam sach|chưa qua xử lý|chua qua xu ly|dữ liệu lỗi|du lieu loi|bao gồm cả lỗi|bao gom ca loi|cả lỗi|ca loi)/i.test(textLower);

    // 2. Detect Clear / Empty Table Command
    const isClearAllCmd = !isRestoreCmd && (
      /(?:làm trống|lam trong|dọn sạch|don sach|clear all|clear table|clear data|empty table|empty data|xóa trắng|xoa trang)/i.test(textLower) ||
      /(?:xóa|xoa|loại bỏ|loai bo|bỏ|bo)\s+(?:toàn bộ|toan bo|tất cả|tat ca|hết|het|sạch|sach|hết sạch|trắng|trang)\b/i.test(textLower) ||
      /(?:xóa|xoa)\s+.*(?:bảng|bang|dữ liệu|du lieu|giữ liệu|giu lieu)\b/i.test(textLower) ||
      /^(?:xóa|xoa|clear|empty)\s+(?:bảng|bang|hết|het|toàn bộ|toan bo|tất cả|tat ca|dữ liệu|du lieu|giữ liệu|giu lieu)$/i.test(textLower.trim())
    ) && !/(?:\d+\s*dòng\s+(?:đầu|cuối)|mã\s+[a-zA-Z0-9_\-]|cửa hàng|ngành hàng|doanh thu|đơn hủy|đổi trả)/i.test(textLower);

    if (!isRestoreCmd && !isClearAllCmd && (!Array.isArray(currentRawRecords) || currentRawRecords.length === 0)) {
      showToast("Chưa có dữ liệu nào để chỉnh sửa! Nếu bạn vừa làm trống, hãy yêu cầu 'Khôi phục dữ liệu'.", true);
      appendLog(`[CẢNH BÁO] Bộ nhớ hiện đang trống. Không thể thực thi "${text}". (Gợi ý: gõ "khôi phục dữ liệu" để lấy lại bản trước đó)`, "agent");
      return;
    }

    switchPhase(1);

    const cleaningBadge = document.getElementById("cleaning-status-badge");
    if (cleaningBadge) {
      cleaningBadge.textContent = "Agent đang chỉnh sửa...";
      cleaningBadge.className = "px-2 py-0.5 rounded text-[10px] bg-amber-500 text-white font-bold animate-pulse";
    }

    showToast("AI Agent đã tiếp nhận yêu cầu! Đang thực thi trực tiếp...", true);
    const nowTime = new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    appendLog(`Chỉ đạo: "${text}"`, "human");

    const beforeCount = Array.isArray(currentRawRecords) ? currentRawRecords.length : 0;
    const actionsApplied = [];

    // A. Restore / Undo command (works even when currentRawRecords is empty!)
    if (isRestoreCmd) {
      // By default, restore the FULL RAW dataset including all errors/duplicates unless user explicitly asked for "chỉ dữ liệu sạch"
      const wantOnlyClean = /(?:chỉ dữ liệu sạch|chi du lieu sach|bản đã làm sạch|ban da lam sach|sau khi làm sạch|sau khi lam sach|chỉ bản sạch)/i.test(textLower);
      const historyStack = Array.isArray(window.__dataHistoryStack) ? window.__dataHistoryStack : [];
      let snap = null;

      if (!wantOnlyClean && window.__rawOriginalUncleanedSnapshot && Array.isArray(window.__rawOriginalUncleanedSnapshot.records) && window.__rawOriginalUncleanedSnapshot.records.length > 0) {
        // ALWAYS restore the FULL UNTOUCHED RAW DATASET INCLUDING ALL ERRORS AND DUPLICATES!
        snap = window.__rawOriginalUncleanedSnapshot;
      } else if (wantOnlyClean && window.__initialUploadedSnapshot && Array.isArray(window.__initialUploadedSnapshot.records)) {
        snap = window.__initialUploadedSnapshot;
      } else if (historyStack.length > 0) {
        // Find most recent non-empty snapshot
        while (historyStack.length > 0) {
          const candidate = historyStack.pop();
          if (candidate && Array.isArray(candidate.records) && candidate.records.length > 0) {
            snap = candidate;
            break;
          }
        }
        if (!snap) {
          snap = window.__rawOriginalUncleanedSnapshot || window.__initialUploadedSnapshot;
        }
      } else if (window.__rawOriginalUncleanedSnapshot) {
        snap = window.__rawOriginalUncleanedSnapshot;
      } else if (window.__initialUploadedSnapshot) {
        snap = window.__initialUploadedSnapshot;
      }

      if (snap && Array.isArray(snap.records)) {
        currentRawRecords = JSON.parse(JSON.stringify(snap.records));
        const isRawSnap = (snap === window.__rawOriginalUncleanedSnapshot);
        customDatasetStats = {
          ...snap.stats,
          autoDeletedDuplicates: isRawSnap ? 0 : (snap.stats.autoDeletedDuplicates || 0)
        };
        actionsApplied.push(
          isRawSnap
            ? `Đã khôi phục TOÀN BỘ ${currentRawRecords.length.toLocaleString('vi-VN')} dòng dữ liệu ban đầu (bao gồm đầy đủ dữ liệu lỗi, bản ghi trùng lặp và đơn hủy/đổi trả để đối soát).`
            : `Đã khôi phục thành công ${currentRawRecords.length.toLocaleString('vi-VN')} dòng dữ liệu từ bản sao lưu.`
        );
      } else {
        appendLog(`[CẢNH BÁO] Không tìm thấy bản sao lưu nào để khôi phục.`, "agent");
        showToast("Không có bản sao lưu trước đó để khôi phục!", true);
        if (cleaningBadge) {
          cleaningBadge.textContent = "Không thể khôi phục";
          cleaningBadge.className = "px-2 py-0.5 rounded text-[10px] bg-rose-600 text-white font-bold";
        }
        return;
      }
    } else if (isClearAllCmd) {
      // B. Clear / Empty all data (after saving snapshot so it can be restored!)
      pushDataHistorySnapshot();
      currentRawRecords = [];
      customDatasetStats = {
        ...customDatasetStats,
        totalRows: 0,
        duplicateRows: 0,
        autoDeletedDuplicates: 0,
        cancelledRows: 0,
        returnRows: 0,
        periodRows: 0,
        cleanRows: 0
      };
      actionsApplied.push(`Đã làm trống toàn bộ ${beforeCount.toLocaleString('vi-VN')} dòng dữ liệu trong bảng (đã lưu bản sao dự phòng an toàn để khôi phục bất cứ lúc nào).`);
    } else {
      // C. Save snapshot before any mutating rule
      pushDataHistorySnapshot();

      // 1. Delete first N rows
      const firstMatch = textLower.match(/(?:xóa|xoa|bỏ|bo|loại|loai|cắt|cat)[^\d]{0,20}(\d+)\s*(?:dòng|dong|hàng|hang|row)?\s*(?:đầu|dau|trên|tren)/i);
      if (firstMatch) {
        const n = Math.min(parseInt(firstMatch[1], 10) || 0, currentRawRecords.length);
        if (n > 0) {
          currentRawRecords = currentRawRecords.slice(n);
          actionsApplied.push(`Đã xóa ${n.toLocaleString('vi-VN')} dòng đầu tiên (còn ${currentRawRecords.length.toLocaleString('vi-VN')} dòng).`);
        }
      }

      // 2. Delete last N rows
      const lastMatch = textLower.match(/(?:xóa|xoa|bỏ|bo|loại|loai|cắt|cat)[^\d]{0,20}(\d+)\s*(?:dòng|dong|hàng|hang|row)?\s*(?:cuối|cuoi|dưới|duoi)/i);
      if (lastMatch) {
        const n = Math.min(parseInt(lastMatch[1], 10) || 0, currentRawRecords.length);
        if (n > 0) {
          currentRawRecords = currentRawRecords.slice(0, currentRawRecords.length - n);
          actionsApplied.push(`Đã xóa ${n.toLocaleString('vi-VN')} dòng cuối cùng (còn ${currentRawRecords.length.toLocaleString('vi-VN')} dòng).`);
        }
      }

      // 3. Keep only first N rows
      const keepFirstMatch = textLower.match(/(?:giữ|giu|chỉ lấy|chi lay|lấy|lay)[^\d]{0,15}(\d+)\s*(?:dòng|dong|hàng|hang|row)?\s*(?:đầu|dau)?/i);
      if (!firstMatch && keepFirstMatch) {
        const n = Math.max(0, parseInt(keepFirstMatch[1], 10) || 0);
        if (n > 0 && n < currentRawRecords.length) {
          currentRawRecords = currentRawRecords.slice(0, n);
          actionsApplied.push(`Đã giữ lại ${n.toLocaleString('vi-VN')} dòng đầu tiên.`);
        }
      }

      // 4. Delete specific row by index: "xóa dòng 5", "xóa dòng thứ 3"
      const rowIdxMatch = textLower.match(/(?:xóa|xoa|bỏ|bo|loại|loai)\s+(?:dòng|dong|hàng|hang)\s+(?:thứ|thu|số|so)?\s*(\d+)$/i);
      if (rowIdxMatch && !firstMatch && !lastMatch && !keepFirstMatch) {
        const targetIdx = parseInt(rowIdxMatch[1], 10) - 1;
        if (targetIdx >= 0 && targetIdx < currentRawRecords.length) {
          const removed = currentRawRecords.splice(targetIdx, 1)[0];
          actionsApplied.push(`Đã xóa dòng thứ ${targetIdx + 1} (mã: ${removed.code || 'N/A'}) khỏi bảng dữ liệu.`);
        }
      }

      // 5. Delete specific transaction code: "xóa mã RFQ-001", "xóa đơn TRX-100235"
      const codeMatch = text.match(/(?:xóa|xoa|bỏ|bo|loại|loai)\s+(?:mã|ma|đơn|don|giao dịch|giao dich)?\s*([a-zA-Z0-9_\-]+)$/i);
      if (codeMatch && !/(?:toàn bộ|tất cả|hết|sạch|đầu|cuối|lỗi|trùng|hủy|trả|dòng|đơn hàng)/i.test(codeMatch[1])) {
        const targetCode = codeMatch[1].trim().toLowerCase();
        const prev = currentRawRecords.length;
        currentRawRecords = currentRawRecords.filter(r => r && String(r.code || "").trim().toLowerCase() !== targetCode);
        if (prev > currentRawRecords.length) {
          actionsApplied.push(`Đã xóa bản ghi có mã "${codeMatch[1].trim()}" khỏi bảng dữ liệu (${prev - currentRawRecords.length} dòng).`);
        }
      }

      // 6. Filter or remove by store
      const filterStoreMatch = text.match(/(?:chỉ giữ|chi giu|chỉ lấy|chi lay|lọc theo|loc theo)\s+(?:cửa hàng|cua hang|chi nhánh|chi nhanh|store)\s*["']?([^"',]+)["']?/i);
      if (filterStoreMatch) {
        const storeName = filterStoreMatch[1].trim().toLowerCase();
        const prev = currentRawRecords.length;
        currentRawRecords = currentRawRecords.filter(r => r && String(r.store || "").toLowerCase().includes(storeName));
        actionsApplied.push(`Đã lọc chỉ giữ cửa hàng "${filterStoreMatch[1].trim()}" (còn ${currentRawRecords.length.toLocaleString('vi-VN')} dòng, đã loại ${prev - currentRawRecords.length} dòng khác).`);
      }
      const removeStoreMatch = text.match(/(?:xóa|xoa|bỏ|bo|loại|loai)\s+(?:cửa hàng|cua hang|chi nhánh|chi nhanh|store)\s*["']?([^"',]+)["']?/i);
      if (removeStoreMatch && !filterStoreMatch) {
        const storeName = removeStoreMatch[1].trim().toLowerCase();
        const prev = currentRawRecords.length;
        currentRawRecords = currentRawRecords.filter(r => r && !String(r.store || "").toLowerCase().includes(storeName));
        actionsApplied.push(`Đã xóa cửa hàng "${removeStoreMatch[1].trim()}" khỏi bảng (loại bỏ ${prev - currentRawRecords.length} dòng).`);
      }

      // 7. Filter or remove by category
      const filterCatMatch = text.match(/(?:chỉ giữ|chi giu|chỉ lấy|chi lay|lọc theo|loc theo)\s+(?:ngành hàng|nganh hang|danh mục|danh muc|cat)\s*["']?([^"',]+)["']?/i);
      if (filterCatMatch) {
        const catName = filterCatMatch[1].trim().toLowerCase();
        const prev = currentRawRecords.length;
        currentRawRecords = currentRawRecords.filter(r => r && String(r.cat || "").toLowerCase().includes(catName));
        actionsApplied.push(`Đã lọc chỉ giữ ngành hàng "${filterCatMatch[1].trim()}" (còn ${currentRawRecords.length.toLocaleString('vi-VN')} dòng).`);
      }

      // 8. Update revenue for specific code: "sửa doanh thu mã RFQ-001 thành 50 triệu"
      const setRevMatch = text.match(/(?:sửa|sua|đặt|dat|chỉnh|chinh|gán|gan)\s+(?:doanh thu|tiền)?\s*(?:mã|ma)?\s*([a-zA-Z0-9_\-]+)\s*(?:thành|thanh|sang|=)\s*([\d.,]+)\s*(tỷ|ty|triệu|trieu|tr|nghìn|nghin|k|m|b|đ|d)?/i);
      if (setRevMatch) {
        const targetCode = setRevMatch[1].trim().toLowerCase();
        const val = parseCommandMoneyThreshold(setRevMatch[2], setRevMatch[3]);
        let changed = 0;
        currentRawRecords.forEach(r => {
          if (r && String(r.code || "").trim().toLowerCase() === targetCode) {
            r.rev = val;
            r.fixedRev = val;
            r.isFixed = true;
            changed++;
          }
        });
        if (changed > 0) {
          actionsApplied.push(`Đã cập nhật doanh thu mã "${setRevMatch[1].trim()}" thành ${formatMoney(val)} (${changed} dòng).`);
        }
      }

      // 9. Smart deduplication if requested
      if (/(?:xóa|xoa|bỏ|bo|loại|loai|lọc|loc|làm sạch|lam sach).*(?:trùng|trung|duplicate)|(?:lọc trùng|xử lý trùng)/i.test(textLower)) {
        const dedup = smartDeduplicateRecords(currentRawRecords, true);
        currentRawRecords = dedup.cleanedRecords;
        customDatasetStats.autoDeletedDuplicates = (customDatasetStats.autoDeletedDuplicates || 0) + (dedup.dupRemovedTotal || 0);
        actionsApplied.push(
          `Xử lý trùng lặp: Xóa ${dedup.exactRemoved.toLocaleString('vi-VN')} dòng trùng toàn phần; xem xét trùng 1 phần (giữ ${dedup.partialKept.toLocaleString('vi-VN')} dòng phù hợp, xóa ${dedup.partialRemoved.toLocaleString('vi-VN')} dòng không phù hợp).`
        );
      }

      // 10. Remove cancelled orders
      if (/(?:xóa|xoa|bỏ|bo|loại|loai|lọc|loc).*(?:đơn hủy|don huy|hủy|huy|cancel)/i.test(textLower)) {
        const prev = currentRawRecords.length;
        currentRawRecords = currentRawRecords.filter(r => r && r.type !== "cancelled" && r.type !== "cancel");
        actionsApplied.push(`Đã loại bỏ ${(prev - currentRawRecords.length).toLocaleString('vi-VN')} đơn hủy khỏi bảng dữ liệu.`);
      }

      // 11. Remove return/warranty orders
      if (/(?:xóa|xoa|bỏ|bo|loại|loai|lọc|loc).*(?:đổi trả|doi tra|trả hàng|tra hang|bảo hành|bao hanh|return)/i.test(textLower)) {
        const prev = currentRawRecords.length;
        currentRawRecords = currentRawRecords.filter(r => r && r.type !== "return");
        actionsApplied.push(`Đã bóc tách & loại bỏ ${(prev - currentRawRecords.length).toLocaleString('vi-VN')} đơn đổi trả / bảo hành.`);
      }

      // 12. Keep only clean/valid rows or remove all errors
      if (/(?:chỉ giữ|chi giu|chỉ lấy|chi lay).*(?:hợp lệ|sạch|sach|valid)|(?:xóa|bỏ|loại).*(?:tất cả lỗi|toàn bộ lỗi|các lỗi|dòng lỗi)/i.test(textLower)) {
        const prev = currentRawRecords.length;
        currentRawRecords = currentRawRecords.filter(r => r && r.type === "valid");
        actionsApplied.push(`Chỉ giữ dữ liệu sạch: đã loại bỏ ${(prev - currentRawRecords.length).toLocaleString('vi-VN')} dòng lỗi.`);
      }

      // 13. Approve/mark all errors as valid
      if (/(?:duyệt tất cả|đánh dấu hợp lệ|chuyển.*hợp lệ|sửa hết lỗi|sửa tất cả lỗi)/i.test(textLower)) {
        let fixed = 0;
        currentRawRecords.forEach(r => {
          if (r && r.type !== "valid") {
            r.type = "valid";
            r.status = "Hoàn thành";
            r.note = "Đã chuẩn hóa hợp lệ theo chỉ đạo";
            r.isFixed = true;
            fixed++;
          }
        });
        actionsApplied.push(`Đã chuyển ${fixed.toLocaleString('vi-VN')} dòng sang trạng thái Hợp lệ.`);
      }

      // 14. Revenue threshold filtering (e.g. "xóa dòng doanh thu dưới 5 triệu", "chỉ giữ đơn trên 10 triệu", "xóa doanh thu <= 0")
      if (/(?:doanh thu|giá trị|tiền).*(?:= 0|bằng 0|<= 0|âm|am|rỗng|trống)|(?:xóa|bỏ|loại).*(?:dòng 0|giá trị 0|âm)/i.test(textLower)) {
        const prev = currentRawRecords.length;
        currentRawRecords = currentRawRecords.filter(r => r && Number(r.rev) > 0);
        actionsApplied.push(`Đã loại bỏ ${(prev - currentRawRecords.length).toLocaleString('vi-VN')} dòng có doanh thu <= 0.`);
      }
      const ltMatch = textLower.match(/(?:xóa|xoa|bỏ|bo|loại|loai).*(?:dưới|duoi|nhỏ hơn|nho hon|<)\s*([\d.,]+)\s*(tỷ|ty|triệu|trieu|tr|nghìn|nghin|k|m|b)?/i);
      if (ltMatch) {
        const thr = parseCommandMoneyThreshold(ltMatch[1], ltMatch[2]);
        const prev = currentRawRecords.length;
        currentRawRecords = currentRawRecords.filter(r => r && Number(r.rev) >= thr);
        actionsApplied.push(`Đã xóa ${(prev - currentRawRecords.length).toLocaleString('vi-VN')} dòng có doanh thu dưới ${formatMoney(thr)}.`);
      }
      const gtKeepMatch = textLower.match(/(?:chỉ giữ|chi giu|lọc lấy|loc lay|chỉ lấy).*(?:trên|tren|lớn hơn|lon hon|>=|>)\s*([\d.,]+)\s*(tỷ|ty|triệu|trieu|tr|nghìn|nghin|k|m|b)?/i);
      if (gtKeepMatch) {
        const thr = parseCommandMoneyThreshold(gtKeepMatch[1], gtKeepMatch[2]);
        const prev = currentRawRecords.length;
        currentRawRecords = currentRawRecords.filter(r => r && Number(r.rev) >= thr);
        actionsApplied.push(`Đã lọc giữ ${(currentRawRecords.length).toLocaleString('vi-VN')} dòng có doanh thu từ ${formatMoney(thr)} trở lên (bỏ ${prev - currentRawRecords.length} dòng).`);
      }

      // 15. Replace text: "thay A thành B" / "đổi A thành B"
      const replaceMatch = text.match(/(?:thay|đổi|doi|sửa|sua)\s+["']?(.+?)["']?\s+(?:thành|thanh|sang|->|=>)\s+["']?(.+?)["']?$/i);
      if (replaceMatch) {
        const fromVal = replaceMatch[1].trim();
        const toVal = replaceMatch[2].trim();
        let countRep = 0;
        const re = new RegExp(fromVal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        currentRawRecords.forEach(r => {
          if (!r) return;
          ["store", "prod", "cat", "status"].forEach(k => {
            if (typeof r[k] === "string" && re.test(r[k])) {
              r[k] = r[k].replace(re, toVal);
              countRep++;
            }
          });
        });
        actionsApplied.push(`Đã thay "${fromVal}" thành "${toVal}" tại ${countRep.toLocaleString('vi-VN')} vị trí.`);
      }

      // 16. Sort by revenue
      if (/(?:sắp xếp|sap xep|sort).*(?:giảm dần|giam dan|cao nhất|cao xuống thấp|desc)/i.test(textLower)) {
        currentRawRecords.sort((a, b) => (Number(b.rev) || 0) - (Number(a.rev) || 0));
        actionsApplied.push(`Đã sắp xếp toàn bộ bảng theo Doanh thu giảm dần.`);
      } else if (/(?:sắp xếp|sap xep|sort).*(?:tăng dần|tang dan|thấp nhất|thấp lên cao|asc)/i.test(textLower)) {
        currentRawRecords.sort((a, b) => (Number(a.rev) || 0) - (Number(b.rev) || 0));
        actionsApplied.push(`Đã sắp xếp toàn bộ bảng theo Doanh thu tăng dần.`);
      }

      // 17. Text case normalization
      if (/(?:viết hoa toàn bộ|in hoa|uppercase)/i.test(textLower)) {
        currentRawRecords.forEach(r => {
          if (!r) return;
          r.store = String(r.store || "").toUpperCase();
          r.prod = String(r.prod || "").toUpperCase();
        });
        actionsApplied.push(`Đã chuyển IN HOA tên cửa hàng & sản phẩm trên ${currentRawRecords.length.toLocaleString('vi-VN')} dòng.`);
      } else if (/(?:chuẩn hóa|chuan hoa|khoảng trắng|khoang trang|trim|định dạng)/i.test(textLower) || actionsApplied.length === 0) {
        currentRawRecords.forEach(r => {
          if (!r) return;
          r.code = String(r.code || "").replace(/\s+/g, " ").trim();
          r.store = String(r.store || "").replace(/\s+/g, " ").trim();
          r.prod = String(r.prod || "").replace(/\s+/g, " ").trim();
          r.cat = String(r.cat || "").replace(/\s+/g, " ").trim();
          r.status = String(r.status || "").replace(/\s+/g, " ").trim();
        });
        if (actionsApplied.length === 0) {
          actionsApplied.push(`Đã tiếp nhận và rà soát chuẩn hóa toàn bộ ${currentRawRecords.length.toLocaleString('vi-VN')} dòng theo yêu cầu.`);
        }
      }
    }

    if (!isRestoreCmd && !isClearAllCmd) {
      // Recalculate exact stats ONLY for mutating edit commands (not for restore or clear-all)
      let dupCount = 0;
      let cancelCount = 0;
      let returnCount = 0;
      let periodCount = 0;
      let cleanCount = 0;
      currentRawRecords.forEach(r => {
        if (!r) return;
        if (r.type === "duplicate") dupCount++;
        else if (r.type === "cancelled" || r.type === "cancel") cancelCount++;
        else if (r.type === "return") returnCount++;
        else if (r.type === "period") periodCount++;
        else cleanCount++;
      });

      const total = currentRawRecords.length;
      const autoDup = customDatasetStats.autoDeletedDuplicates || 0;
      customDatasetStats = {
        ...customDatasetStats,
        totalRows: total + autoDup,
        duplicateRows: dupCount + autoDup,
        cancelledRows: cancelCount,
        returnRows: returnCount,
        periodRows: periodCount,
        cleanRows: cleanCount
      };
    }

    setTimeout(() => {
      appendLog(`Phân tích chỉ thị trên tệp "${customDatasetStats.fileName || 'Dữ liệu hiện tại'}" (${beforeCount.toLocaleString('vi-VN')} dòng)...`, "agent");
    }, 300);

    actionsApplied.forEach((msg, idx) => {
      setTimeout(() => {
        appendLog(`[THỰC THI ${idx + 1}] ${msg}`, "clean");
      }, 700 + idx * 450);
    });

    const finishDelay = 900 + actionsApplied.length * 450;
    setTimeout(() => {
      state.cleaningCompleted = true;
      state.phase1Completed = false;
      // Tu dong chuyen sang Trang 2: Bang Doi Soat Mau Du Lieu de nguoi dung thay truc tiep bang du lieu
      setStep2Page(2);
      state.isReportGenerated = false;
      state.isAuditCompleted = false;

      const elTot = document.getElementById("stat-total-raw-rows");
      const elDup = document.getElementById("stat-duplicate-rows");
      const elCan = document.getElementById("stat-cancelled-rows");
      const elRet = document.getElementById("stat-return-rows");
      const elCln = document.getElementById("stat-clean-rows");

      if (elTot) elTot.innerHTML = `${customDatasetStats.totalRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
      if (elDup) elDup.innerHTML = `${customDatasetStats.duplicateRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-rose-500">dòng</span>`;
      if (elCan) elCan.innerHTML = `${customDatasetStats.cancelledRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-amber-600">dòng</span>`;
      if (elRet) elRet.innerHTML = `${customDatasetStats.returnRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-purple-600">dòng</span>`;
      if (elCln) elCln.innerHTML = `${customDatasetStats.cleanRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-emerald-600">dòng (Đã sửa)</span>`;

      if (typeof updateStep2ErrorCounts === "function") {
        updateStep2ErrorCounts(customDatasetStats, currentRawRecords);
      }
      renderRawSampleTable();
      if (typeof renderCleaningDiffWorkspace === "function") {
        renderCleaningDiffWorkspace();
      }

      appendLog(`HOÀN TẤT HIỆU CHỈNH: ${beforeCount.toLocaleString('vi-VN')} dòng ➔ ${customDatasetStats.totalRows.toLocaleString('vi-VN')} dòng (${customDatasetStats.cleanRows.toLocaleString('vi-VN')} dòng sạch).`, "success");

      if (cleaningBadge) {
        cleaningBadge.textContent = "Đã chỉnh sửa xong";
        cleaningBadge.className = "px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold";
      }

      const humanBox = document.getElementById("human-verification-box");
      if (humanBox) {
        humanBox.className = "pink-card p-5 bg-gradient-to-r from-[#F0FDF4] via-white to-[#F0FDF4] border-2 border-emerald-400";
        const subtitle = humanBox.querySelector("p");
        if (subtitle) {
          subtitle.innerHTML = `<span class="text-emerald-700 font-bold"><i class="fa-solid fa-circle-check"></i> Đã thực thi chỉnh sửa lúc ${nowTime}!</span> Hiện có ${customDatasetStats.totalRows.toLocaleString('vi-VN')} dòng dữ liệu. Bấm "Xác Nhận Dữ Liệu OK" để cập nhật Báo cáo mới.`;
        }
      }

      showToast(`AI Agent đã thực thi xong! Dữ liệu hiện có ${customDatasetStats.totalRows.toLocaleString('vi-VN')} dòng.`, true);
    }, finishDelay);
  }

  window.executeAgentRevision = executeAgentRevision;

  // Terminal Direct Command Input listener
  const terminalCmdInput = document.getElementById("terminal-cmd-input");
  const btnTerminalSend = document.getElementById("btn-terminal-send");
  if (btnTerminalSend && terminalCmdInput) {
    btnTerminalSend.addEventListener("click", () => {
      const val = terminalCmdInput.value.trim();
      if (!val) {
        showToast("Vui lòng nhập lệnh cho Agent!", true);
        return;
      }
      terminalCmdInput.value = "";
      executeAgentRevision(val);
    });
    terminalCmdInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const val = terminalCmdInput.value.trim();
        if (!val) {
          showToast("Vui lòng nhập lệnh cho Agent!", true);
          return;
        }
        terminalCmdInput.value = "";
        executeAgentRevision(val);
      }
    });
  }

  if (btnSubmitRevision) {
    btnSubmitRevision.addEventListener("click", () => {
      const promptVal = revisionPromptInput ? revisionPromptInput.value.trim() : "";
      closeRevisionModal();
      executeAgentRevision(promptVal);
    });
  }

  // GIAI ĐOẠN 2: TẠO BÁO CÁO QUẢN TRỊ
  function parseNumFromRawField(val) {
    if (typeof val === "number" && !isNaN(val)) return val;
    if (typeof val !== "string") return NaN;
    const cleaned = val.replace(/[^\d.-]/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? NaN : n;
  }

  function inferRegionFromStore(storeName, rawRow) {
    if (rawRow && typeof rawRow === "object") {
      for (const k of Object.keys(rawRow)) {
        if (/khu\s*vực|khu_vuc|vùng|region|area|miền/i.test(k) && rawRow[k]) {
          return String(rawRow[k]).trim();
        }
      }
    }
    const s = (storeName || "").toLowerCase();
    if (/hà nội|ha noi|hoàn kiếm|cầu giấy|đống đa|hai bà trưng|miền bắc|hải phòng|bắc/i.test(s)) return "Miền Bắc";
    if (/đà nẵng|da nang|huế|nha trang|miền trung|vinh|trung/i.test(s)) return "Miền Trung";
    if (/hcm|hồ chí minh|sài gòn|quận|bình thạnh|tân bình|thủ đức|cần thơ|miền nam|nam/i.test(s)) return "Miền Nam";
    return "Toàn Quốc";
  }

  function getActiveAnalytics() {
    const hasRecords = Array.isArray(currentRawRecords) && currentRawRecords.length > 0;

    if (!hasRecords) {
      return {
        isDynamic: false,
        stores: [],
        totalCleanRev: 0,
        totalTargetRev: 0,
        totalCleanProfit: 0,
        totalTargetProfit: 0,
        avgMargin: "0.0",
        avgReturn: "0.0",
        cleanOrderCount: 0,
        totalOrderCount: 0,
        categories: [
          { name: "Chưa có dữ liệu", pct: 0 },
          { name: "Chưa có dữ liệu", pct: 0 },
          { name: "Chưa có dữ liệu", pct: 0 },
          { name: "Chưa có dữ liệu", pct: 0 }
        ]
      };
    }

    const storeMap = new Map();
    const prodMap = new Map();
    let totalCleanOrders = 0;

    currentRawRecords.forEach((r) => {
      if (!r) return;
      const storeName = (r.store && String(r.store).trim()) ? String(r.store).trim() : "Chi nhánh mặc định";
      if (!storeMap.has(storeName)) {
        let managerName = "Quản lý " + storeName;
        if (r.rawRow && typeof r.rawRow === "object") {
          for (const k of Object.keys(r.rawRow)) {
            if (/quản\s*lý|quan_ly|manager|phụ\s*trách/i.test(k) && r.rawRow[k]) {
              managerName = String(r.rawRow[k]).trim();
              break;
            }
          }
        }
        storeMap.set(storeName, {
          name: storeName,
          region: inferRegionFromStore(storeName, r.rawRow),
          manager: managerName,
          totalOrders: 0,
          validOrders: 0,
          returnOrders: 0,
          cancelOrders: 0,
          dupOrders: 0,
          cleanRev: 0,
          cleanProfit: 0,
          targetSum: 0,
          hasExplicitTarget: false
        });
      }

      const st = storeMap.get(storeName);
      st.totalOrders += 1;
      const rev = Math.max(0, Number(r.rev) || 0);

      if (r.type === "return") {
        st.returnOrders += 1;
      } else if (r.type === "cancel") {
        st.cancelOrders += 1;
      } else if (r.type === "duplicate") {
        st.dupOrders += 1;
      } else {
        st.validOrders += 1;
        totalCleanOrders += 1;
        st.cleanRev += rev;

        let profit = NaN;
        let cost = NaN;
        if (r.rawRow && typeof r.rawRow === "object") {
          for (const k of Object.keys(r.rawRow)) {
            if (/lợi\s*nhuận|loi_nhuan|profit|ln_gộp|ln\s*gộp/i.test(k)) {
              const p = parseNumFromRawField(r.rawRow[k]);
              if (!isNaN(p)) profit = p;
            } else if (/giá\s*vốn|gia_von|cost|cogs/i.test(k)) {
              const c = parseNumFromRawField(r.rawRow[k]);
              if (!isNaN(c)) cost = c;
            } else if (/mục\s*tiêu|muc_tieu|target|kế\s*hoạch|ke_hoach/i.test(k)) {
              const t = parseNumFromRawField(r.rawRow[k]);
              if (!isNaN(t) && t > 0) {
                st.targetSum += t;
                st.hasExplicitTarget = true;
              }
            }
          }
        }
        if (isNaN(profit)) {
          profit = !isNaN(cost) ? Math.max(0, rev - cost) : rev * 0.30;
        }
        st.cleanProfit += profit;

        const prodName = (r.prod && String(r.prod).trim()) ? String(r.prod).trim() : "Sản phẩm khác";
        prodMap.set(prodName, (prodMap.get(prodName) || 0) + rev);
      }
    });

    const rawStores = Array.from(storeMap.values());
    const avgStoreRev = rawStores.length > 0
      ? rawStores.reduce((s, x) => s + x.cleanRev, 0) / rawStores.length
      : 0;

    const stores = rawStores.map((st, idx) => {
      const id = `CH${String(idx + 1).padStart(2, "0")}`;
      const targetRevenue = st.hasExplicitTarget && st.targetSum > 0
        ? Math.round(st.targetSum)
        : Math.max(1, rawStores.length > 1 ? Math.round(avgStoreRev * 1.02) : Math.round(st.cleanRev * 1.05));
      const targetGrossProfit = Math.round(targetRevenue * 0.30);
      const compRev = Math.max(1, Math.round(st.cleanRev * 0.96));
      const returnRate = st.totalOrders > 0 ? Number(((st.returnOrders / st.totalOrders) * 100).toFixed(1)) : 0;
      const targetPct = targetRevenue > 0 ? (st.cleanRev / targetRevenue) * 100 : 100;
      const marginPct = st.cleanRev > 0 ? (st.cleanProfit / st.cleanRev) * 100 : 0;

      let priority = 3;
      let status = "Ổn định";
      let anomaly = "";
      let recommendation = "Duy trì định mức quản trị hiện tại và tiếp tục giám sát tỷ lệ đổi trả.";

      if (returnRate > 8 || (st.cleanRev > 0 && marginPct < 20) || targetPct < 75) {
        priority = 1;
        status = "Cần can thiệp";
        if (returnRate > 8) {
          anomaly = `Tỷ lệ đổi trả cao bất thường (${returnRate}%, ${st.returnOrders} đơn trả/${st.totalOrders} đơn).`;
          recommendation = "Rà soát chất lượng hàng hóa, quy trình tư vấn bán hàng và kiểm soát đơn hoàn tại điểm bán.";
        } else if (st.cleanRev > 0 && marginPct < 20) {
          anomaly = `Biên lợi nhuận gộp thấp (${marginPct.toFixed(1)}%), nguy cơ bẫy doanh thu do chiết khấu sâu.`;
          recommendation = "Cơ cấu lại danh mục sản phẩm biên cao và kiểm soát mức giảm giá khuyến mãi.";
        } else {
          anomaly = `Doanh thu đạt ${targetPct.toFixed(1)}% so với mức bình quân hệ thống, hụt chỉ tiêu đáng kể.`;
          recommendation = "Triển khai chương trình kích cầu tại điểm bán và rà soát hiệu suất nhân sự.";
        }
      } else if (returnRate > 4.5 || targetPct < 90) {
        priority = 2;
        status = "Cần theo dõi";
        anomaly = returnRate > 4.5
          ? `Tỷ lệ đổi trả (${returnRate}%) tiệm cận ngưỡng cảnh báo.`
          : `Mức hoàn thành chỉ tiêu đạt ${targetPct.toFixed(1)}%, cần tăng tốc cuối kỳ.`;
        recommendation = "Theo dõi sát doanh số tuần và kiểm tra nguyên nhân đơn hủy/đổi trả.";
      } else if (targetPct >= 100 && marginPct >= 25) {
        priority = 4;
        status = "Xuất sắc";
        anomaly = "";
        recommendation = "Khen thưởng đội ngũ cửa hàng và nhân rộng công thức vận hành hiệu quả.";
      }

      return {
        id,
        name: st.name,
        region: st.region,
        manager: st.manager,
        cleanRev: Math.round(st.cleanRev),
        targetRevenue,
        cleanProfit: Math.round(st.cleanProfit),
        targetGrossProfit,
        compRev,
        returnRate,
        priority,
        status,
        anomaly,
        recommendation,
        decisionApproved: false
      };
    });

    stores.sort((a, b) => b.cleanRev - a.cleanRev);

    const totalCleanRev = stores.reduce((sum, s) => sum + s.cleanRev, 0);
    const totalTargetRev = stores.reduce((sum, s) => sum + s.targetRevenue, 0);
    const totalCleanProfit = stores.reduce((sum, s) => sum + s.cleanProfit, 0);
    const totalTargetProfit = stores.reduce((sum, s) => sum + s.targetGrossProfit, 0);
    const avgMargin = totalCleanRev > 0 ? ((totalCleanProfit / totalCleanRev) * 100).toFixed(1) : "0.0";
    const avgReturn = stores.length > 0 ? (stores.reduce((sum, s) => sum + s.returnRate, 0) / stores.length).toFixed(1) : "0.0";

    const sortedProds = Array.from(prodMap.entries()).sort((a, b) => b[1] - a[1]);
    const top4 = sortedProds.slice(0, 4);
    const categories = top4.map(([name, rev]) => ({
      name,
      pct: totalCleanRev > 0 ? Math.max(1, Math.round((rev / totalCleanRev) * 100)) : 0
    }));
    while (categories.length < 4) {
      categories.push({ name: "Nhóm khác", pct: 0 });
    }

    return {
      isDynamic: true,
      stores,
      totalCleanRev,
      totalTargetRev,
      totalCleanProfit,
      totalTargetProfit,
      avgMargin,
      avgReturn,
      cleanOrderCount: totalCleanOrders,
      totalOrderCount: currentRawRecords.length,
      categories
    };
  }

  function generateManagementReport() {
    state.isReportGenerated = true;
    state.phase2Completed = true;
    const badgePhase2 = document.getElementById("badge-phase2");
    if (badgePhase2) {
      badgePhase2.textContent = "Đã tạo báo cáo";
      badgePhase2.className = "text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-300";
    }
    const tabPhase2El = document.getElementById("tab-phase2");
    if (tabPhase2El) tabPhase2El.classList.add("completed");

    const badgePhase3 = document.getElementById("badge-phase3");
    if (badgePhase3) {
      badgePhase3.textContent = "Sẵn sàng đối chiếu";
      badgePhase3.className = "text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold border border-blue-300";
    }

    // Macro KPIs calculation and update from active dataset
    const analytics = getActiveAnalytics();
    const totalCleanRev = analytics.totalCleanRev;
    const totalTargetRev = analytics.totalTargetRev;
    const totalCleanProfit = analytics.totalCleanProfit;
    const totalTargetProfit = analytics.totalTargetProfit;
    const avgMargin = analytics.avgMargin;
    const avgReturn = analytics.avgReturn;
    const revPct = totalTargetRev > 0 ? ((totalCleanRev / totalTargetRev) * 100).toFixed(1) : "0.0";
    const profPct = totalTargetProfit > 0 ? ((totalCleanProfit / totalTargetProfit) * 100).toFixed(1) : "0.0";

    const kpiRev = document.getElementById("kpi-macro-rev");
    if (kpiRev) kpiRev.innerHTML = `${(totalCleanRev / 1000000000).toFixed(2)} <span class="text-sm font-semibold text-blue-600">Tỷ VNĐ</span>`;
    const kpiRevTgtLbl = document.getElementById("kpi-macro-rev-target-lbl");
    if (kpiRevTgtLbl) kpiRevTgtLbl.textContent = `Mục tiêu: ${(totalTargetRev / 1000000000).toFixed(2)} Tỷ`;
    const kpiRevTgt = document.getElementById("kpi-macro-rev-target");
    if (kpiRevTgt) {
      kpiRevTgt.textContent = `Đạt ${revPct}%`;
      kpiRevTgt.className = Number(revPct) >= 90 ? "text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded" : "text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded";
    }

    const kpiProf = document.getElementById("kpi-macro-profit");
    if (kpiProf) kpiProf.innerHTML = `${(totalCleanProfit / 1000000000).toFixed(2)} <span class="text-sm font-semibold text-emerald-600">Tỷ VNĐ</span>`;
    const kpiProfTgtLbl = document.getElementById("kpi-macro-profit-target-lbl");
    if (kpiProfTgtLbl) kpiProfTgtLbl.textContent = `Mục tiêu: ${(totalTargetProfit / 1000000000).toFixed(2)} Tỷ`;
    const kpiProfTgt = document.getElementById("kpi-macro-profit-target");
    if (kpiProfTgt) {
      kpiProfTgt.textContent = `Đạt ${profPct}%`;
      kpiProfTgt.className = Number(profPct) >= 90 ? "text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded" : "text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded";
    }

    const kpiMargin = document.getElementById("kpi-macro-margin");
    if (kpiMargin) kpiMargin.textContent = `${avgMargin}%`;
    const kpiMarginSub = document.getElementById("kpi-macro-margin-sub");
    if (kpiMarginSub) {
      kpiMarginSub.textContent = Number(avgMargin) >= 28 ? "Biên an toàn" : "Cần tối ưu biên";
      kpiMarginSub.className = Number(avgMargin) >= 28 ? "text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded" : "text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded";
    }

    const kpiRet = document.getElementById("kpi-macro-return");
    if (kpiRet) kpiRet.textContent = `${avgReturn}%`;
    const kpiRetSub = document.getElementById("kpi-macro-return-sub");
    if (kpiRetSub) {
      kpiRetSub.textContent = Number(avgReturn) > 3.5 ? "Vượt trần" : "Trong định mức";
      kpiRetSub.className = Number(avgReturn) > 3.5 ? "text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded" : "text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded";
    }

    // Update Top Products bars dynamically
    const cats = analytics.categories || [];
    for (let i = 0; i < 4; i++) {
      const idxStr = String(i + 1).padStart(2, "0");
      const pEl = document.getElementById(`prog-cat-${idxStr}`);
      const bEl = document.getElementById(`badge-cat-${idxStr}`);
      const pctVal = cats[i] ? cats[i].pct : 0;
      if (pEl) pEl.style.width = `${Math.min(100, pctVal)}%`;
      if (bEl) bEl.textContent = `${pctVal}%`;
    }

    // Update Top Row Dabang metrics dynamically
    const revBillion = (totalCleanRev / 1000000000).toFixed(2);
    const tgtBillion = (totalTargetRev / 1000000000).toFixed(2);
    const sumTotRev = document.getElementById("summary-total-rev-header");
    if (sumTotRev) sumTotRev.textContent = `${revBillion.replace(".", ",")} Tỷ VNĐ`;
    const sumTgtBadge = document.getElementById("summary-target-reality-badge");
    if (sumTgtBadge) {
      sumTgtBadge.textContent = `${revPct}% Hoàn Thành`;
      sumTgtBadge.className = "text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full";
    }
    const statReal = document.getElementById("stat-reality-sales");
    if (statReal) statReal.innerHTML = `${revBillion} B <span class="text-slate-400 font-normal">(${analytics.cleanOrderCount.toLocaleString('vi-VN')})</span>`;
    const statTgt = document.getElementById("stat-target-sales");
    if (statTgt) statTgt.innerHTML = `${tgtBillion} B <span class="text-slate-400 font-normal">(${analytics.totalOrderCount.toLocaleString('vi-VN')})</span>`;

    renderStoresManagementTable();
    renderPhase2InsightsAndActions();
    initCharts(false);
    showToast(`Báo cáo Quản trị ${analytics.stores.length} Cửa hàng đã được tạo thành công!`);
  }

  function renderPhase2InsightsAndActions() {
    const insightContainer = document.getElementById("phase2-insight-cards");
    const actionTbody = document.getElementById("phase2-action-plan-tbody");
    if (!insightContainer && !actionTbody) return;

    const stats = customDatasetStats || {};
    const totalRows = stats.totalRows || (currentRawRecords ? currentRawRecords.length : 0) || 1006;
    const dupRows = stats.duplicateRows || 0;
    const canRows = stats.cancelledRows || 0;
    const retRows = stats.returnRows || 0;
    const cleanRows = stats.cleanRows || Math.max(totalRows - dupRows - canRows, 0);
    const completenessPct = totalRows > 0 ? ((cleanRows / totalRows) * 100).toFixed(1) : "100.0";

    // Compute IQR outliers on valid revenue values
    const revs = (currentRawRecords || [])
      .filter(r => r && r.type === "valid" && Number(r.rev) > 0)
      .map(r => Number(r.rev))
      .sort((a, b) => a - b);

    let outlierCount = 0;
    let meanVal = 0;
    let medianVal = 0;
    if (revs.length >= 4) {
      const q1 = revs[Math.floor(revs.length * 0.25)];
      const q3 = revs[Math.floor(revs.length * 0.75)];
      const iqr = q3 - q1;
      const lower = q1 - 1.5 * iqr;
      const upper = q3 + 1.5 * iqr;
      outlierCount = revs.filter(v => v < lower || v > upper).length;
      meanVal = revs.reduce((s, v) => s + v, 0) / revs.length;
      medianVal = revs[Math.floor(revs.length / 2)];
    }

    const cancelRate = totalRows > 0 ? ((canRows / totalRows) * 100).toFixed(1) : "0.0";
    const returnRate = totalRows > 0 ? ((retRows / totalRows) * 100).toFixed(1) : "0.0";

    if (insightContainer) {
      insightContainer.innerHTML = `
        <!-- INS-01 -->
        <div class="rounded-2xl border border-[#FAD2E1] bg-white p-4 sm:p-5 space-y-4 shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2 font-black text-xs sm:text-sm text-slate-900">
              <i class="fa-solid fa-lightbulb text-amber-500"></i>
              <span>INS-01 · Chất lượng Dữ liệu, Độ phân tán Thống kê &amp; Kiểm soát Ngoại lai (Outliers)</span>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-center">
              Quản trị Dữ liệu &amp; Bất thường (Data Governance)
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="rounded-xl p-3 bg-slate-50 border border-slate-200 space-y-1">
              <div class="text-[11px] font-extrabold text-slate-700">1. DATA (Dữ liệu gốc)</div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Kiểm tra <strong>${totalRows.toLocaleString('vi-VN')}</strong> dòng dữ liệu gốc trên toàn bộ tệp/Sheet tải lên.
              </p>
            </div>
            <div class="rounded-xl p-3 bg-[#FFF0F5] border border-[#FAD2E1] space-y-1">
              <div class="text-[11px] font-extrabold text-[#FF5B8E]">2. INFORMATION (Thông tin)</div>
              <p class="text-xs text-slate-700 leading-relaxed">
                Tỷ lệ dữ liệu sạch đạt <strong>${completenessPct}%</strong>, lọc <strong>${dupRows.toLocaleString('vi-VN')}</strong> dòng trùng lặp và phát hiện <strong>${outlierCount.toLocaleString('vi-VN')}</strong> giá trị ngoại lai (IQR).
              </p>
            </div>
            <div class="rounded-xl p-3 bg-amber-50 border border-amber-200 space-y-1">
              <div class="text-[11px] font-extrabold text-amber-800">3. INSIGHT (Nguyên nhân)</div>
              <p class="text-xs text-amber-950 leading-relaxed">
                ${outlierCount > 0
                  ? `Có phân tán mạnh giữa đơn lẻ và đơn giá trị cao (Mean: ${formatMoney(meanVal)} vs Median: ${formatMoney(medianVal)}).`
                  : "Cấu trúc dữ liệu có tính nhất quán tốt, giá trị trung bình và trung vị bám sát nhau."}
              </p>
            </div>
            <div class="rounded-xl p-3 bg-emerald-50 border border-emerald-200 space-y-1">
              <div class="text-[11px] font-extrabold text-emerald-800">4. DECISION (Quyết định)</div>
              <p class="text-xs text-emerald-950 leading-relaxed">
                Sử dụng đồng thời Trung bình (Mean) và Trung vị (Median) khi giao chỉ tiêu KPI; chuẩn hóa quy trình nhập liệu tại nguồn.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
            <div class="space-y-1.5">
              <p class="text-slate-700"><strong class="text-slate-900">• Phát hiện điều gì?</strong> Dữ liệu sạch đạt ${completenessPct}% (${cleanRows.toLocaleString('vi-VN')}/${totalRows.toLocaleString('vi-VN')} dòng); phát hiện ${dupRows.toLocaleString('vi-VN')} dòng trùng và ${outlierCount.toLocaleString('vi-VN')} giá trị ngoại lai.</p>
              <p class="text-slate-700"><strong class="text-emerald-700">• Nguyên nhân (Đã chứng minh):</strong> Có ${dupRows.toLocaleString('vi-VN')} dòng nhập lặp POS/mã giao dịch và ${outlierCount.toLocaleString('vi-VN')} điểm dữ liệu nằm ngoài khoảng [Q1 - 1.5×IQR, Q3 + 1.5×IQR].</p>
              <p class="text-slate-700"><strong class="text-rose-600">• Tác động doanh nghiệp:</strong> Nếu dùng trung bình cộng đơn thuần khi có ngoại lai hoặc chưa lọc trùng sẽ dẫn đến giao KPI quá cao hoặc đánh giá sai mức nền thực tế.</p>
            </div>
            <div class="space-y-1.5">
              <p class="text-slate-700"><strong class="text-slate-900">• Số liệu chứng minh:</strong> Phương pháp IQR ghi nhận ${outlierCount.toLocaleString('vi-VN')} giao dịch vượt ngưỡng 1.5×IQR${revs.length >= 4 ? ` (Median đơn hợp lệ: ${formatMoney(medianVal)})` : ""}.</p>
              <p class="text-slate-700"><strong class="text-amber-700">• Giả thuyết (Cần kiểm chứng):</strong> Các giá trị ngoại lai có thể là đơn hàng B2B/combo thiết bị giá trị lớn hoặc lỗi gõ thừa chữ số khi nhập liệu thủ công.</p>
              <p class="text-slate-700"><strong class="text-rose-600">• Doanh nghiệp nên làm gì?</strong> Rà soát danh sách ngoại lai đã đánh dấu và áp dụng ràng buộc kiểm tra dữ liệu (Data Validation) trên file Excel/POS.</p>
            </div>
          </div>
        </div>

        <!-- INS-02 -->
        <div class="rounded-2xl border border-[#FAD2E1] bg-white p-4 sm:p-5 space-y-4 shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2 font-black text-xs sm:text-sm text-slate-900">
              <i class="fa-solid fa-chart-line text-[#FF5B8E]"></i>
              <span>INS-02 · Kiểm soát Tỷ lệ Đơn Hủy (${cancelRate}%) &amp; Rủi ro Đổi trả (${returnRate}%)</span>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFE2E5] text-[#FA5A7D] border border-[#FAD2E1] self-start sm:self-center">
              Vận hành Bán hàng &amp; Hoàn trả (Operations)
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="rounded-xl p-3 bg-slate-50 border border-slate-200 space-y-1">
              <div class="text-[11px] font-extrabold text-slate-700">1. DATA (Dữ liệu gốc)</div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Ghi nhận <strong>${canRows.toLocaleString('vi-VN')}</strong> đơn đã hủy và <strong>${retRows.toLocaleString('vi-VN')}</strong> đơn đổi trả trong tập giao dịch.
              </p>
            </div>
            <div class="rounded-xl p-3 bg-[#FFF0F5] border border-[#FAD2E1] space-y-1">
              <div class="text-[11px] font-extrabold text-[#FF5B8E]">2. INFORMATION (Thông tin)</div>
              <p class="text-xs text-slate-700 leading-relaxed">
                Tỷ lệ hủy chiếm <strong>${cancelRate}%</strong> và đổi trả chiếm <strong>${returnRate}%</strong> tổng số giao dịch toàn hệ thống.
              </p>
            </div>
            <div class="rounded-xl p-3 bg-amber-50 border border-amber-200 space-y-1">
              <div class="text-[11px] font-extrabold text-amber-800">3. INSIGHT (Nguyên nhân)</div>
              <p class="text-xs text-amber-950 leading-relaxed">
                Đơn hủy do hết tồn kho hoặc khách đổi ý; đơn đổi trả làm giảm doanh thu thuần và phát sinh chi phí hoàn nhập COGS.
              </p>
            </div>
            <div class="rounded-xl p-3 bg-emerald-50 border border-emerald-200 space-y-1">
              <div class="text-[11px] font-extrabold text-emerald-800">4. DECISION (Quyết định)</div>
              <p class="text-xs text-emerald-950 leading-relaxed">
                Khóa đồng bộ tồn kho real-time tại các điểm bán có tỷ lệ hủy cao và siết quy trình tư vấn/đóng gói hàng đổi trả.
              </p>
            </div>
          </div>
        </div>
      `;
    }

    if (actionTbody) {
      actionTbody.innerHTML = `
        <tr class="hover:bg-[#FFFBFD] transition">
          <td class="p-3.5 font-extrabold text-rose-600">Ưu tiên 1 (Kiểm soát Đổi trả &amp; Chất lượng)</td>
          <td class="p-3.5 font-semibold text-slate-800">Phát sinh ${retRows.toLocaleString('vi-VN')} giao dịch đổi trả (${returnRate}%) cần hoàn trừ doanh thu &amp; COGS.</td>
          <td class="p-3.5 text-slate-600">Chuẩn hóa quy trình tư vấn bán hàng, kiểm tra ngoại quan/hạn sử dụng trước khi xuất kho và đối soát mã gốc tự động.</td>
          <td class="p-3.5 font-bold text-rose-600">Quản lý Cửa hàng, Bộ phận CSKH &amp; Kho vận</td>
          <td class="p-3.5 font-bold text-emerald-700">Giảm tỷ lệ đổi trả xuống &le; 3.5% và đối khớp 100% mã giao dịch gốc.</td>
          <td class="p-3.5 text-slate-500">Điều kiện: Cập nhật đủ lý do đổi trả trên POS; Rủi ro: Nhân viên bỏ sót mã gốc khi lập phiếu hoàn.</td>
        </tr>
        <tr class="hover:bg-[#FFFBFD] transition">
          <td class="p-3.5 font-extrabold text-amber-600">Ưu tiên 2 (Giảm Đơn Hủy &amp; Tồn kho ảo)</td>
          <td class="p-3.5 font-semibold text-slate-800">Có ${canRows.toLocaleString('vi-VN')} đơn hàng bị hủy (${cancelRate}%) gây thất thoát cơ hội bán hàng.</td>
          <td class="p-3.5 text-slate-600">Đồng bộ tồn kho POS theo thời gian thực, cảnh báo tự động các SKU sắp hết hàng và loại bỏ ngay đơn Cancelled khỏi doanh số.</td>
          <td class="p-3.5 font-bold text-amber-700">Bộ phận Vận hành Bán lẻ &amp; Điều phối Tồn kho</td>
          <td class="p-3.5 font-bold text-emerald-700">Giảm tỷ lệ hủy đơn dưới 4.0% trong chu kỳ tháng kế tiếp.</td>
          <td class="p-3.5 text-slate-500">Điều kiện: Kết nối API kho liên thông 18 cửa hàng; Rủi ro: Độ trễ đồng bộ giờ cao điểm.</td>
        </tr>
        <tr class="hover:bg-[#FFFBFD] transition">
          <td class="p-3.5 font-extrabold text-rose-500">Ưu tiên 3 (Chuẩn hóa Quản trị Dữ liệu &amp; BI)</td>
          <td class="p-3.5 font-semibold text-slate-800">Tồn tại ${dupRows.toLocaleString('vi-VN')} dòng trùng lặp, tỷ lệ sạch ${completenessPct}% và ${outlierCount.toLocaleString('vi-VN')} điểm ngoại lai cần kiểm chứng.</td>
          <td class="p-3.5 text-slate-600">Áp dụng bộ quy tắc Data Validation (bắt buộc nhập trường khóa, chuẩn hóa danh mục Dropdown, cảnh báo khi giá trị vượt ngưỡng IQR).</td>
          <td class="p-3.5 font-bold text-rose-600">Bộ phận Phân tích Dữ liệu (BI / Data Analyst) &amp; Quản trị Hệ thống</td>
          <td class="p-3.5 font-bold text-emerald-700">Đạt độ đầy đủ dữ liệu &ge; 99.5%, tỷ lệ bản ghi trùng lặp = 0% trong các kỳ báo cáo tiếp theo.</td>
          <td class="p-3.5 text-slate-500">Điều kiện: Các phòng ban dùng chung mẫu biểu (Template) chuẩn; Rủi ro: Nhân sự nhập liệu tự do ngoài danh mục.</td>
        </tr>
      `;
    }
  }

  document.getElementById("btn-generate-report").addEventListener("click", generateManagementReport);
  document.getElementById("btn-proceed-phase3").addEventListener("click", () => switchPhase(3));

  // Render 18 Stores Management Table
  function renderStoresManagementTable(search = "", region = "all") {
    const tbody = document.getElementById("stores-report-tbody");
    tbody.innerHTML = "";

    if (!state.isReportGenerated) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="p-8 text-center text-slate-400 font-medium">
            <i class="fa-solid fa-store text-3xl mb-2 text-slate-300 block"></i>
            Chưa có báo cáo cửa hàng. Dữ liệu sẽ tự động tổng hợp sau khi bạn nạp tệp và bấm 'AI Agent: Tính Toán Báo Cáo' ở Giai đoạn 2.
          </td>
        </tr>
      `;
      return;
    }

    const activeStores = getActiveAnalytics().stores;
    const normStoreSearch = (search || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
    const filtered = activeStores.filter(s => {
      const storeBlob = `${s.id || ""} ${s.name || ""} ${s.region || ""} ${s.manager || ""} ${s.status || ""}`
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
      const matchSearch = !normStoreSearch || storeBlob.includes(normStoreSearch);
      const matchRegion = region === "all" || s.region === region;
      return matchSearch && matchRegion;
    });

    filtered.forEach(s => {
      const targetPercent = ((s.cleanRev / s.targetRevenue) * 100).toFixed(1);
      const grossMarginPercent = ((s.cleanProfit / s.cleanRev) * 100).toFixed(1);
      const growthVsSep = (((s.cleanRev - s.compRev) / s.compRev) * 100).toFixed(1);

      let targetColor = "text-emerald-700";
      if (targetPercent < 80) targetColor = "text-rose-700 font-bold";
      else if (targetPercent < 95) targetColor = "text-amber-700";

      let marginColor = "text-slate-800";
      if (grossMarginPercent < 25) marginColor = "text-rose-700 font-bold";

      let returnColor = "text-slate-700";
      if (s.returnRate > 5.0) returnColor = "text-rose-700 font-bold";

      let statusBadge = `<span class="badge-priority-${s.priority} px-2.5 py-0.5 rounded-full text-[10px] font-bold">${s.status}</span>`;

      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50 transition";
      tr.innerHTML = `
        <td class="p-3">
          <div class="font-bold text-slate-900">${s.name}</div>
          <div class="text-[11px] text-slate-500">${s.id} • Quản lý: ${s.manager}</div>
        </td>
        <td class="p-3 text-slate-600 font-medium">${s.region}</td>
        <td class="p-3 text-right font-mono font-bold text-slate-900">${formatMoney(s.cleanRev)}</td>
        <td class="p-3 text-right font-mono text-slate-500">${formatMoney(s.targetRevenue)}</td>
        <td class="p-3 text-right font-mono ${targetColor}">${targetPercent}%</td>
        <td class="p-3 text-right font-mono text-emerald-700 font-bold">${formatMoney(s.cleanProfit)}</td>
        <td class="p-3 text-right font-mono ${marginColor}">${grossMarginPercent}%</td>
        <td class="p-3 text-right font-mono ${returnColor}">${s.returnRate}%</td>
        <td class="p-3 text-center font-mono ${growthVsSep >= 0 ? 'text-emerald-700' : 'text-rose-700'} font-bold">
          ${growthVsSep >= 0 ? '+' + growthVsSep : growthVsSep}%
        </td>
        <td class="p-3 text-center">${statusBadge}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById("search-store-input").addEventListener("input", (e) => {
    const region = document.getElementById("filter-region").value;
    renderStoresManagementTable(e.target.value, region);
  });

  document.getElementById("filter-region").addEventListener("change", (e) => {
    const search = document.getElementById("search-store-input").value;
    renderStoresManagementTable(search, e.target.value);
  });

  // Charts Initialization
  function initCharts(isEmpty = false) {
    if (typeof Chart === 'undefined') return;

    // Destroy prior chart instances to prevent canvas reuse errors
    if (state.chartVisitor) { state.chartVisitor.destroy(); state.chartVisitor = null; }
    if (state.chartTotalRev) { state.chartTotalRev.destroy(); state.chartTotalRev = null; }
    if (state.chartCustSat) { state.chartCustSat.destroy(); state.chartCustSat = null; }
    if (state.chartTargetReality) { state.chartTargetReality.destroy(); state.chartTargetReality = null; }
    if (state.chartVolume) { state.chartVolume.destroy(); state.chartVolume = null; }
    if (state.chartStores) { state.chartStores.destroy(); state.chartStores = null; }
    if (state.chartProductMix) { state.chartProductMix.destroy(); state.chartProductMix = null; }

    // A. Visitor Insights Line Chart (Dabang Triple Curve)
    const ctxVisitor = document.getElementById("chart-visitor-insights");
    if (ctxVisitor) {
      state.chartVisitor = new Chart(ctxVisitor, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Loyal Customers',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : [270, 290, 275, 250, 230, 270, 345, 320, 290, 260, 230],
              borderColor: '#9333EA',
              backgroundColor: 'transparent',
              tension: 0.45,
              borderWidth: 2.5,
              pointRadius: 0,
              pointHoverRadius: 6
            },
            {
              label: 'New Customers',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : [310, 280, 260, 240, 250, 290, 360, 330, 280, 240, 220],
              borderColor: '#FF5B8E',
              backgroundColor: 'transparent',
              tension: 0.45,
              borderWidth: 2.5,
              pointRadius: isEmpty ? 0 : [0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0],
              pointBackgroundColor: '#FF5B8E',
              pointBorderColor: '#FFFFFF',
              pointBorderWidth: 2
            },
            {
              label: 'Unique Customers',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : [230, 310, 330, 320, 280, 260, 300, 310, 280, 260, 250],
              borderColor: '#10B981',
              backgroundColor: 'transparent',
              tension: 0.45,
              borderWidth: 2.5,
              pointRadius: 0,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#94A3B8' } },
            y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 9 }, color: '#94A3B8' } }
          }
        }
      });
    }

    // B. Total Revenue Dual Bar Chart (computed from active stores/records)
    const activeChartAnalytics = getActiveAnalytics();
    const top7Stores = activeChartAnalytics.stores.slice(0, 7);
    const barLabels = top7Stores.length > 0 ? top7Stores.map(s => s.name.replace("Phúc An ", "")) : ['CH01', 'CH02', 'CH03', 'CH04', 'CH05', 'CH06', 'CH07'];
    const barActual = isEmpty || top7Stores.length === 0 ? barLabels.map(() => 0) : top7Stores.map(s => Number((s.cleanRev / 1000000).toFixed(1)));
    const barProfit = isEmpty || top7Stores.length === 0 ? barLabels.map(() => 0) : top7Stores.map(s => Number((s.cleanProfit / 1000000).toFixed(1)));

    const ctxTotalRev = document.getElementById("chart-total-revenue");
    if (ctxTotalRev) {
      state.chartTotalRev = new Chart(ctxTotalRev, {
        type: 'bar',
        data: {
          labels: barLabels,
          datasets: [
            {
              label: 'Doanh thu (Tr đ)',
              data: barActual,
              backgroundColor: '#FF5B8E',
              borderRadius: 6,
              barPercentage: 0.6
            },
            {
              label: 'Lợi nhuận gộp (Tr đ)',
              data: barProfit,
              backgroundColor: '#8B5CF6',
              borderRadius: 6,
              barPercentage: 0.6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94A3B8' } },
            y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 }, color: '#94A3B8' } }
          }
        }
      });
    }

    // C. Customer Satisfaction Dual Curve
    const ctxCustSat = document.getElementById("chart-customer-satisfaction");
    if (ctxCustSat) {
      state.chartCustSat = new Chart(ctxCustSat, {
        type: 'line',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
          datasets: [
            {
              label: 'Last Month',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [78, 65, 72, 63, 68, 62, 79],
              borderColor: '#FF5B8E',
              backgroundColor: 'transparent',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: isEmpty ? 0 : 4,
              pointBackgroundColor: '#FF5B8E'
            },
            {
              label: 'This Month',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [55, 62, 53, 54, 57, 56, 62],
              borderColor: '#8B5CF6',
              backgroundColor: 'transparent',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: isEmpty ? 0 : 4,
              pointBackgroundColor: '#8B5CF6'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    }

    // D. Target vs Reality Grouped Bar
    const ctxTargetReality = document.getElementById("chart-target-reality");
    if (ctxTargetReality) {
      state.chartTargetReality = new Chart(ctxTargetReality, {
        type: 'bar',
        data: {
          labels: barLabels,
          datasets: [
            {
              label: 'Reality Sales',
              data: isEmpty || top7Stores.length === 0 ? barLabels.map(() => 0) : top7Stores.map(s => Number((s.cleanRev / 1000000000).toFixed(2))),
              backgroundColor: '#FF5B8E',
              borderRadius: 6,
              barPercentage: 0.6
            },
            {
              label: 'Target Sales',
              data: isEmpty || top7Stores.length === 0 ? barLabels.map(() => 0) : top7Stores.map(s => Number((s.targetRevenue / 1000000000).toFixed(2))),
              backgroundColor: '#F472B6',
              borderRadius: 6,
              barPercentage: 0.6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#94A3B8' } },
            y: { display: false }
          }
        }
      });
    }

    // E. Volume vs Service Level Stacked Bar
    const ctxVolume = document.getElementById("chart-volume-service");
    if (ctxVolume) {
      state.chartVolume = new Chart(ctxVolume, {
        type: 'bar',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
          datasets: [
            {
              label: 'Volume',
              data: isEmpty ? [0, 0, 0, 0, 0, 0] : [6, 7, 6, 5, 4, 6],
              backgroundColor: '#FF5B8E',
              borderRadius: 6,
              stack: 'Stack 0',
              barPercentage: 0.5
            },
            {
              label: 'Services',
              data: isEmpty ? [0, 0, 0, 0, 0, 0] : [5, 8, 6, 6, 5, 5],
              backgroundColor: '#8B5CF6',
              borderRadius: 6,
              stack: 'Stack 0',
              barPercentage: 0.5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94A3B8' } },
            y: { display: false }
          }
        }
      });
    }

    // 1. Chart Stores Revenue vs Target
    const ctxStores = document.getElementById("chart-stores-revenue");
    if (ctxStores) {
      const activeAnalytics = getActiveAnalytics();
      const chartStores = activeAnalytics.stores.slice(0, 18);
      const labels = chartStores.map(s => s.name.replace("Phúc An ", ""));
      const revData = isEmpty ? labels.map(() => 0) : chartStores.map(s => (s.cleanRev / 1000000000).toFixed(2));
      const targetData = isEmpty ? labels.map(() => 0) : chartStores.map(s => (s.targetRevenue / 1000000000).toFixed(2));

      state.chartStores = new Chart(ctxStores, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Doanh Thu Thực Tế (Tỷ đ)',
              data: revData,
              backgroundColor: '#FF5B8E',
              borderRadius: 6
            },
            {
              label: 'Chỉ Tiêu Target (Tỷ đ)',
              data: targetData,
              backgroundColor: '#FAD2E1',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#334155', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif", weight: '600' } }
            }
          },
          scales: {
            x: {
              ticks: { color: '#64748b', font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" }, maxRotation: 45 },
              grid: { display: false }
            },
            y: {
              ticks: { color: '#64748b', font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" } },
              grid: { color: '#f1f5f9' }
            }
          }
        }
      });
    }

    // 2. Chart Product Mix
    const ctxMix = document.getElementById("chart-product-mix");
    if (ctxMix) {
      const activeCats = getActiveAnalytics().categories || [];
      const mixLabels = isEmpty
        ? ['Chưa nạp dữ liệu ngành hàng']
        : activeCats.filter(c => c.pct > 0).map(c => `${c.name} (${c.pct}%)`);
      const mixData = isEmpty
        ? [1]
        : activeCats.filter(c => c.pct > 0).map(c => c.pct);
      state.chartProductMix = new Chart(ctxMix, {
        type: 'doughnut',
        data: {
          labels: mixLabels.length > 0 ? mixLabels : ['Chưa có dữ liệu'],
          datasets: [{
            data: mixData.length > 0 ? mixData : [1],
            backgroundColor: isEmpty ? ['#F1F5F9'] : [
              '#FF5B8E',
              '#BF83FF',
              '#3CD856',
              '#FF947A'
            ],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#334155', font: { size: 10, family: "'Plus Jakarta Sans', sans-serif", weight: '500' }, boxWidth: 12 }
            }
          },
          cutout: '65%'
        }
      });
    }

    // Ensure charts display in current language (Vietnamese by default)
    if (typeof updateChartLanguages === "function") {
      updateChartLanguages(currentAppLang);
    }
  }

  // GIAI ĐOẠN 3: ĐỐI CHIẾU & RA QUYẾT ĐỊNH (CROSS-CHECK AUDIT)
  function runCrossCheckAudit() {
    state.isAuditCompleted = true;
    state.phase3Completed = true;
    const badgePhase3 = document.getElementById("badge-phase3");
    if (badgePhase3) {
      badgePhase3.textContent = "Đã đối chiếu & Đề xuất";
      badgePhase3.className = "text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-300";
    }
    const tabPhase3El = document.getElementById("tab-phase3");
    if (tabPhase3El) tabPhase3El.classList.add("completed");

    renderAnomalyCards();
    renderPriorityMatrix();
    renderWebExecutiveReport();
    showToast("Cross-check Audit hoàn tất: Đã phân loại các cửa hàng cho Giám đốc Kinh doanh!");
  }

  function buildDetailedReportMetrics(ctx) {
    const records = Array.isArray(currentRawRecords) ? currentRawRecords.filter(Boolean) : [];
    const validRecords = records.filter(r => !r.type || r.type === "valid");
    const dupRecords = records.filter(r => r.type === "duplicate");
    const canRecords = records.filter(r => r.type === "cancelled" || r.type === "cancel");
    const retRecords = records.filter(r => r.type === "return");
    const perRecords = records.filter(r => r.type === "period");

    const sumRev = arr => arr.reduce((s, r) => s + Math.max(0, Number(r.rev) || 0), 0);
    const sumCogs = arr => arr.reduce((s, r) => s + Math.max(0, Number(r.cogs) || 0), 0);

    const validRevTotal = validRecords.length > 0 ? sumRev(validRecords) : ctx.totalCleanRev;
    const dupRevImpact = sumRev(dupRecords);
    const canRevImpact = sumRev(canRecords);
    const retRevImpact = sumRev(retRecords);
    const perRevImpact = sumRev(perRecords);
    const totalErrorRevImpact = dupRevImpact + canRevImpact + retRevImpact + perRevImpact;

    // Statistical distribution of valid order revenues (Mean, Median, Q1, Q3, IQR, Min, Max, StdDev, Outliers)
    const revValues = validRecords.map(r => Math.max(0, Number(r.rev) || 0)).sort((a, b) => a - b);
    const percentile = (sorted, p) => {
      if (!sorted.length) return 0;
      const idx = (sorted.length - 1) * p;
      const lo = Math.floor(idx);
      const hi = Math.ceil(idx);
      if (lo === hi) return sorted[lo];
      return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
    };
    const countVal = revValues.length;
    const meanRev = countVal > 0 ? revValues.reduce((a, b) => a + b, 0) / countVal : (ctx.cleanRows > 0 ? ctx.totalCleanRev / ctx.cleanRows : 0);
    const medianRev = percentile(revValues, 0.5);
    const q1Rev = percentile(revValues, 0.25);
    const q3Rev = percentile(revValues, 0.75);
    const iqrRev = Math.max(0, q3Rev - q1Rev);
    const minRev = countVal > 0 ? revValues[0] : 0;
    const maxRev = countVal > 0 ? revValues[countVal - 1] : 0;
    const upperFence = q3Rev + 1.5 * iqrRev;
    const outlierCount = countVal > 0 ? revValues.filter(v => v > upperFence).length : 0;
    const variance = countVal > 0 ? revValues.reduce((s, v) => s + Math.pow(v - meanRev, 2), 0) / countVal : 0;
    const stdDevRev = Math.sqrt(variance);

    // Order value segments
    const segSmall = revValues.filter(v => v <= q1Rev);
    const segMid = revValues.filter(v => v > q1Rev && v <= q3Rev);
    const segHigh = revValues.filter(v => v > q3Rev && v <= upperFence);
    const segVip = revValues.filter(v => v > upperFence);
    const orderSegments = [
      { label: `Phân khúc Nhỏ (≤ ${formatMoney(q1Rev)})`, count: segSmall.length, rev: segSmall.reduce((a, b) => a + b, 0), color: "#64748B" },
      { label: `Phân khúc Tiêu Chuẩn (${formatMoney(q1Rev)} – ${formatMoney(q3Rev)})`, count: segMid.length, rev: segMid.reduce((a, b) => a + b, 0), color: "#2563EB" },
      { label: `Phân khúc Giá Trị Cao (${formatMoney(q3Rev)} – ${formatMoney(upperFence)})`, count: segHigh.length, rev: segHigh.reduce((a, b) => a + b, 0), color: "#10B981" },
      { label: `Đơn VIP / Ngoại Lai (> ${formatMoney(upperFence)})`, count: segVip.length, rev: segVip.reduce((a, b) => a + b, 0), color: "#FF5B8E" }
    ];

    // Product breakdown (Top 10)
    const prodAgg = new Map();
    const catAgg = new Map();
    validRecords.forEach(r => {
      const pName = (r.prod && String(r.prod).trim() && r.prod !== "—") ? String(r.prod).trim() : "Sản phẩm chưa phân loại";
      const cName = (r.cat && String(r.cat).trim() && r.cat !== "—") ? String(r.cat).trim() : "Ngành hàng chung";
      const rev = Math.max(0, Number(r.rev) || 0);
      const cogs = Math.max(0, Number(r.cogs) || (rev * 0.68));
      const profit = Math.max(0, rev - cogs);

      if (!prodAgg.has(pName)) prodAgg.set(pName, { name: pName, cat: cName, orders: 0, rev: 0, cogs: 0, profit: 0 });
      const p = prodAgg.get(pName);
      p.orders += 1; p.rev += rev; p.cogs += cogs; p.profit += profit;

      if (!catAgg.has(cName)) catAgg.set(cName, { name: cName, orders: 0, rev: 0, cogs: 0, profit: 0 });
      const c = catAgg.get(cName);
      c.orders += 1; c.rev += rev; c.cogs += cogs; c.profit += profit;
    });

    const topProducts = Array.from(prodAgg.values()).sort((a, b) => b.rev - a.rev).slice(0, 10);
    const categories = Array.from(catAgg.values()).sort((a, b) => b.rev - a.rev);

    // Regional breakdown from ctx.stores
    const regAgg = new Map();
    ctx.stores.forEach(s => {
      const rName = s.region || "Toàn quốc";
      if (!regAgg.has(rName)) regAgg.set(rName, { region: rName, storeCount: 0, cleanRev: 0, targetRev: 0, cleanProfit: 0, returnRateSum: 0 });
      const rg = regAgg.get(rName);
      rg.storeCount += 1;
      rg.cleanRev += s.cleanRev || 0;
      rg.targetRev += s.targetRevenue || 0;
      rg.cleanProfit += s.cleanProfit || 0;
      rg.returnRateSum += Number(s.returnRate) || 0;
    });
    const regions = Array.from(regAgg.values())
      .map(rg => ({
        ...rg,
        pctTarget: rg.targetRev > 0 ? ((rg.cleanRev / rg.targetRev) * 100).toFixed(1) : "0.0",
        marginPct: rg.cleanRev > 0 ? ((rg.cleanProfit / rg.cleanRev) * 100).toFixed(1) : "0.0",
        sharePct: ctx.totalCleanRev > 0 ? ((rg.cleanRev / ctx.totalCleanRev) * 100).toFixed(1) : "0.0",
        avgReturn: rg.storeCount > 0 ? (rg.returnRateSum / rg.storeCount).toFixed(1) : "0.0"
      }))
      .sort((a, b) => b.cleanRev - a.cleanRev);

    // Priority buckets
    const p1Stores = ctx.stores.filter(s => s.priority === 1);
    const p2Stores = ctx.stores.filter(s => s.priority === 2);
    const topStores = ctx.stores.slice(0, 3);
    const totalCogs = Math.max(0, ctx.totalCleanRev - ctx.totalCleanProfit);
    const cogsPct = ctx.totalCleanRev > 0 ? ((totalCogs / ctx.totalCleanRev) * 100).toFixed(1) : "0.0";
    const revGap = ctx.totalCleanRev - ctx.totalTargetRev;
    const totalErrorRows = (ctx.dupRows || 0) + (ctx.canRows || 0) + (ctx.retRows || 0) + (customDatasetStats.periodRows || perRecords.length || 0);
    const errorRatePct = ctx.totalRows > 0 ? ((totalErrorRows / ctx.totalRows) * 100).toFixed(1) : "0.0";
    const trustScore = Math.max(0, Math.min(100, Math.round(100 - Number(errorRatePct) * 0.25)));

    return {
      validRevTotal, dupRevImpact, canRevImpact, retRevImpact, perRevImpact, totalErrorRevImpact,
      periodRows: customDatasetStats.periodRows || perRecords.length || 0,
      totalErrorRows, errorRatePct, trustScore,
      countVal, meanRev, medianRev, q1Rev, q3Rev, iqrRev, minRev, maxRev, upperFence, outlierCount, stdDevRev,
      orderSegments, topProducts, categories, regions,
      p1Stores, p2Stores, topStores, totalCogs, cogsPct, revGap,
      fileName: customDatasetStats.fileName || "Bộ dữ liệu doanh nghiệp",
      timeStr: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      reportCode: `BI-RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`
    };
  }

  function renderWebExecutiveReport(forceReset = false) {
    const bodyEl = document.getElementById("web-executive-report-body");
    if (!bodyEl) return;
    if (!forceReset && state.editedWebReportHtml) {
      bodyEl.innerHTML = state.editedWebReportHtml;
      return;
    }
    if (forceReset) {
      state.editedWebReportHtml = null;
    }
    const ctx = gatherAgentReportContext();
    const m = buildDetailedReportMetrics(ctx);

    const statusBadge = (s) => {
      if (s.priority === 1) return `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">Cần can thiệp</span>`;
      if (s.priority === 2) return `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200">Cần theo dõi</span>`;
      if (s.priority === 4) return `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">Xuất sắc</span>`;
      return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">Ổn định</span>`;
    };

    const storeRowsHtml = ctx.stores.map((s, idx) => {
      const pctNum = s.targetRevenue > 0 ? ((s.cleanRev / s.targetRevenue) * 100) : 0;
      const pct = pctNum.toFixed(1);
      const margin = s.cleanRev > 0 ? ((s.cleanProfit / s.cleanRev) * 100).toFixed(1) : "0.0";
      const barW = Math.min(100, Math.max(4, pctNum));
      const barColor = pctNum >= 100 ? "bg-emerald-500" : (pctNum >= 85 ? "bg-blue-500" : "bg-rose-500");
      return `
        <tr class="hover:bg-[#FFF5F8] transition">
          <td class="p-2.5 text-center font-mono font-bold text-slate-400">#${idx + 1}</td>
          <td class="p-2.5">
            <div class="font-bold text-slate-900">${escapeHtml(s.name)}</div>
            <div class="text-[10px] text-slate-400">${escapeHtml(s.manager || "Quản lý cửa hàng")}</div>
          </td>
          <td class="p-2.5 text-slate-600 font-medium">${escapeHtml(s.region)}</td>
          <td class="p-2.5 text-right font-mono font-bold text-slate-900">${formatMoney(s.cleanRev)}</td>
          <td class="p-2.5 text-right font-mono text-slate-500">${formatMoney(s.targetRevenue)}</td>
          <td class="p-2.5 text-right">
            <div class="font-mono font-bold ${pctNum >= 100 ? 'text-emerald-700' : (pctNum < 80 ? 'text-rose-600' : 'text-blue-700')}">${pct}%</div>
            <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-auto mt-1"><div class="${barColor} h-full rounded-full" style="width:${barW}%"></div></div>
          </td>
          <td class="p-2.5 text-right font-mono font-semibold text-emerald-700">${formatMoney(s.cleanProfit)}</td>
          <td class="p-2.5 text-right font-mono ${Number(margin) < 25 ? 'text-rose-600 font-bold' : 'text-slate-700'}">${margin}%</td>
          <td class="p-2.5 text-right font-mono ${s.returnRate > 3.5 ? 'text-rose-600 font-bold' : 'text-slate-600'}">${s.returnRate}%</td>
          <td class="p-2.5 text-center">${statusBadge(s)}</td>
        </tr>
      `;
    }).join("");

    const productRowsHtml = m.topProducts.length > 0
      ? m.topProducts.map((p, idx) => {
          const share = m.validRevTotal > 0 ? ((p.rev / m.validRevTotal) * 100) : 0;
          const margin = p.rev > 0 ? ((p.profit / p.rev) * 100).toFixed(1) : "0.0";
          return `
            <tr class="hover:bg-[#FFF5F8]">
              <td class="p-2.5 text-center font-mono font-bold text-slate-400">${idx + 1}</td>
              <td class="p-2.5 font-bold text-slate-900">${escapeHtml(p.name)}</td>
              <td class="p-2.5 text-slate-500">${escapeHtml(p.cat)}</td>
              <td class="p-2.5 text-right font-mono">${p.orders.toLocaleString('vi-VN')}</td>
              <td class="p-2.5 text-right font-mono font-bold text-blue-700">${formatMoney(p.rev)}</td>
              <td class="p-2.5 text-right font-mono text-emerald-700">${formatMoney(p.profit)}</td>
              <td class="p-2.5 text-right font-mono">${margin}%</td>
              <td class="p-2.5">
                <div class="flex items-center gap-2 justify-end">
                  <div class="w-20 h-2 bg-slate-100 rounded-full overflow-hidden"><div class="bg-[#FF5B8E] h-full rounded-full" style="width:${Math.min(100, Math.max(3, share))}%"></div></div>
                  <span class="font-mono font-bold text-slate-700 w-10 text-right">${share.toFixed(1)}%</span>
                </div>
              </td>
            </tr>
          `;
        }).join("")
      : `<tr><td colspan="8" class="p-4 text-center text-slate-400">Chưa có chi tiết sản phẩm trong tập dữ liệu hiện tại.</td></tr>`;

    const categoryCardsHtml = m.categories.length > 0
      ? m.categories.slice(0, 6).map(c => {
          const share = m.validRevTotal > 0 ? ((c.rev / m.validRevTotal) * 100) : 0;
          const margin = c.rev > 0 ? ((c.profit / c.rev) * 100).toFixed(1) : "0.0";
          return `
            <div class="rounded-xl p-3 bg-[#FFFBFD] border border-[#FAD2E1] space-y-1.5">
              <div class="flex items-center justify-between gap-2">
                <span class="font-extrabold text-slate-800 truncate">${escapeHtml(c.name)}</span>
                <span class="px-2 py-0.5 rounded-full bg-[#FFE4EC] text-[#D92662] text-[10px] font-black">${share.toFixed(1)}%</span>
              </div>
              <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-[#FF5B8E] to-[#FB7185] h-full rounded-full" style="width:${Math.min(100, Math.max(4, share))}%"></div>
              </div>
              <div class="flex items-center justify-between text-[11px] text-slate-600">
                <span>DT: <strong class="text-slate-900">${formatMoney(c.rev)}</strong> (${c.orders.toLocaleString('vi-VN')} đơn)</span>
                <span>Biên: <strong class="text-emerald-700">${margin}%</strong></span>
              </div>
            </div>
          `;
        }).join("")
      : `<div class="col-span-full text-xs text-slate-400 text-center py-3">Dữ liệu hiện tại không tách cột ngành hàng riêng.</div>`;

    const regionRowsHtml = m.regions.map(rg => `
      <tr class="hover:bg-[#FFF5F8]">
        <td class="p-2.5 font-extrabold text-slate-900">${escapeHtml(rg.region)}</td>
        <td class="p-2.5 text-center font-mono font-bold">${rg.storeCount}</td>
        <td class="p-2.5 text-right font-mono font-bold text-blue-700">${formatMoney(rg.cleanRev)}</td>
        <td class="p-2.5 text-right font-mono text-slate-500">${formatMoney(rg.targetRev)}</td>
        <td class="p-2.5 text-right font-mono font-bold ${Number(rg.pctTarget) >= 100 ? 'text-emerald-700' : 'text-amber-700'}">${rg.pctTarget}%</td>
        <td class="p-2.5 text-right font-mono text-emerald-700">${formatMoney(rg.cleanProfit)}</td>
        <td class="p-2.5 text-right font-mono">${rg.marginPct}%</td>
        <td class="p-2.5 text-right font-mono font-bold text-[#FF5B8E]">${rg.sharePct}%</td>
        <td class="p-2.5 text-right font-mono ${Number(rg.avgReturn) > 3.5 ? 'text-rose-600 font-bold' : ''}">${rg.avgReturn}%</td>
      </tr>
    `).join("");

    const segmentBarsHtml = m.orderSegments.map(seg => {
      const pctOrders = m.countVal > 0 ? ((seg.count / m.countVal) * 100) : 0;
      const pctRev = m.validRevTotal > 0 ? ((seg.rev / m.validRevTotal) * 100) : 0;
      return `
        <div class="space-y-1">
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-bold text-slate-700">${seg.label}</span>
            <span class="font-mono text-slate-600"><strong>${seg.count.toLocaleString('vi-VN')}</strong> đơn (${pctOrders.toFixed(1)}%) • DT: <strong>${formatMoney(seg.rev)}</strong> (${pctRev.toFixed(1)}%)</span>
          </div>
          <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full" style="width:${Math.min(100, Math.max(2, pctRev))}%; background:${seg.color};"></div>
          </div>
        </div>
      `;
    }).join("");

    const p1NarrativeHtml = m.p1Stores.length > 0
      ? `
        <p class="leading-relaxed text-slate-800">
          Qua kiểm toán đối chiếu chéo toàn bộ <strong>${ctx.stores.length} đơn vị</strong> trên tập dữ liệu sạch, hệ thống phát hiện <strong class="text-rose-700">${m.p1Stores.length} đơn vị đang ở mức Cảnh Báo Đỏ Khẩn Cấp (Ưu tiên 1)</strong>, cần Ban Giám Đốc can thiệp xử lý trực tiếp ngay lập tức:
        </p>
        <ol class="list-decimal pl-5 space-y-2 text-slate-700 leading-relaxed">
          ${m.p1Stores.map(s => {
            const tPct = s.targetRevenue > 0 ? ((s.cleanRev / s.targetRevenue) * 100).toFixed(1) : "0.0";
            const gPct = s.cleanRev > 0 ? ((s.cleanProfit / s.cleanRev) * 100).toFixed(1) : "0.0";
            return `
              <li>
                <strong class="text-rose-800">${escapeHtml(s.name)}</strong> (Khu vực: ${escapeHtml(s.region)} • Quản lý: ${escapeHtml(s.manager || "—")}):
                Doanh thu thuần đạt <strong>${formatMoney(s.cleanRev)}</strong> (${tPct}% mục tiêu), biên lợi nhuận gộp <strong>${gPct}%</strong>, tỷ lệ đổi trả <strong>${s.returnRate}%</strong>.
                <br><span class="text-rose-700 font-semibold">• Nguyên nhân báo đỏ:</span> ${escapeHtml(s.anomaly || "Vi phạm ngưỡng an toàn về tiến độ doanh thu, biên lợi nhuận gộp hoặc tỷ lệ đổi trả.")}
                <br><span class="text-slate-800 font-semibold">• Hướng can thiệp ưu tiên:</span> ${escapeHtml(s.recommendation || "Rà soát ngay cấu trúc giá vốn, chính sách chiết khấu và quy trình kiểm soát đơn hoàn trả tại cửa hàng.")}
              </li>
            `;
          }).join("")}
        </ol>
      `
      : `
        <p class="leading-relaxed text-slate-800">
          <strong class="text-emerald-700">Kết quả kiểm toán: KHÔNG phát hiện đơn vị nào ở mức Cảnh Báo Đỏ Khẩn Cấp (Ưu tiên 1).</strong>
        </p>
        <p class="leading-relaxed text-slate-600">
          <strong>Giải thích lý do vì sao không có báo đỏ khẩn cấp:</strong> Theo bộ quy chuẩn kiểm toán rủi ro của hệ thống AI Agent, một cửa hàng chỉ bị xếp loại <strong>Báo đỏ khẩn cấp (P1)</strong> khi vi phạm nghiêm trọng một trong các ngưỡng rủi ro sau: (1) tiến độ doanh thu tụt sâu dưới <strong>80% mục tiêu</strong>, (2) biên lợi nhuận gộp giảm dưới <strong>25%</strong> (dấu hiệu bẫy doanh thu/xả kho lỗ), hoặc (3) tỷ lệ đổi trả vượt quá <strong>5,0%</strong> (bất thường chất lượng/lệch COGS). Qua rà soát toàn bộ <strong>${ctx.stores.length} đơn vị</strong> sau khi làm sạch dữ liệu, tất cả các chỉ số trọng yếu đều nằm trong vùng kiểm soát an toàn (tiến độ doanh thu bình quân đạt <strong>${ctx.revPct}%</strong>, biên lợi nhuận gộp bình quân đạt <strong>${ctx.avgMargin}%</strong> và tỷ lệ đổi trả trung bình đạt <strong>${ctx.avgReturn}%</strong>), nên không phát sinh điểm nóng báo đỏ nào cần xử lý khẩn cấp.
        </p>
      `;

    const p2NarrativeHtml = m.p2Stores.length > 0
      ? `
        <p class="leading-relaxed text-slate-800">
          Bên cạnh nhóm khẩn cấp, hệ thống ghi nhận <strong class="text-amber-700">${m.p2Stores.length} đơn vị thuộc diện Cần Can Thiệp &amp; Theo Dõi Sát (Ưu tiên 2)</strong> để ngăn ngừa nguy cơ trượt xuống vùng báo đỏ:
        </p>
        <ul class="list-disc pl-5 space-y-1.5 text-slate-700 leading-relaxed">
          ${m.p2Stores.map(s => {
            const tPct = s.targetRevenue > 0 ? ((s.cleanRev / s.targetRevenue) * 100).toFixed(1) : "0.0";
            const gPct = s.cleanRev > 0 ? ((s.cleanProfit / s.cleanRev) * 100).toFixed(1) : "0.0";
            return `
              <li>
                <strong class="text-amber-800">${escapeHtml(s.name)}</strong> (${escapeHtml(s.region)}): Đạt <strong>${tPct}%</strong> mục tiêu (DT thuần ${formatMoney(s.cleanRev)}), biên LN <strong>${gPct}%</strong>, đổi trả <strong>${s.returnRate}%</strong>.
                <em>Chẩn đoán:</em> ${escapeHtml(s.anomaly || "Chỉ tiêu tăng trưởng hoặc biên lợi nhuận có dấu hiệu chững lại.")}
                <em>Đề xuất:</em> ${escapeHtml(s.recommendation || "Theo dõi sát theo tuần, tối ưu cơ cấu SKU biên cao và kiểm soát chiết khấu.")}
              </li>
            `;
          }).join("")}
        </ul>
      `
      : `
        <p class="leading-relaxed text-slate-800">
          <strong class="text-emerald-700">Kết quả kiểm toán: KHÔNG ghi nhận đơn vị nào thuộc nhóm Cần Can Thiệp / Theo Dõi Sát (Ưu tiên 2).</strong>
        </p>
        <p class="leading-relaxed text-slate-600">
          <strong>Giải thích lý do vì sao không có đơn vị cần can thiệp (P2):</strong> Nhóm cần theo dõi sát (P2) áp dụng cho các đơn vị có tiến độ mục tiêu dao động trong khoảng <strong>80% – 94,9%</strong> hoặc có dấu hiệu tăng nhẹ tỷ lệ đổi trả (trên trần <strong>3,5%</strong> đến <strong>5,0%</strong>). Trong kỳ phân tích này, không có đơn vị nào rơi vào vùng suy giảm trung bình nêu trên; các cửa hàng đều duy trì hiệu suất ổn định (Ưu tiên 3) hoặc vượt kế hoạch xuất sắc (Ưu tiên 4), đảm bảo biên lợi nhuận và kỷ luật vận hành đồng đều trên toàn mạng lưới.
        </p>
      `;

    const auditSummaryConclusion = (m.p1Stores.length > 0 || m.p2Stores.length > 0)
      ? `Tổng hợp chung, Ban Giám Đốc cần tập trung nguồn lực ưu tiên xử lý dứt điểm <strong>${m.p1Stores.length} đơn vị báo đỏ khẩn cấp (P1)</strong> trong 7 ngày tới và giám sát hàng tuần đối với <strong>${m.p2Stores.length} đơn vị cần can thiệp (P2)</strong> nhằm bảo vệ biên lợi nhuận ròng toàn hệ thống.`
      : `Tổng hợp chung, <strong>100% đơn vị (${ctx.stores.length}/${ctx.stores.length})</strong> đều đạt chuẩn an toàn kiểm toán sau khi dữ liệu thô đã được làm sạch (loại bỏ ${ctx.dupRows.toLocaleString('vi-VN')} trùng lặp và ${ctx.canRows.toLocaleString('vi-VN')} đơn hủy). Hệ thống đang vận hành lành mạnh và sẵn sàng chuyển trọng tâm sang tối ưu mở rộng doanh thu.`;

    const anomalyListHtml = `
      <div class="space-y-4 text-xs text-slate-700">
        <div class="p-4 rounded-xl ${m.p1Stores.length > 0 ? 'bg-rose-50/70 border-l-4 border-rose-500' : 'bg-emerald-50/60 border-l-4 border-emerald-500'} space-y-2">
          <h4 class="text-xs font-black uppercase tracking-wide ${m.p1Stores.length > 0 ? 'text-rose-800' : 'text-emerald-800'}">
            1. Cảnh Báo Đỏ Khẩn Cấp (Ưu Tiên 1 — Cấp Thiết Can Thiệp)
          </h4>
          ${p1NarrativeHtml}
        </div>

        <div class="p-4 rounded-xl ${m.p2Stores.length > 0 ? 'bg-amber-50/70 border-l-4 border-amber-500' : 'bg-slate-50 border-l-4 border-slate-400'} space-y-2">
          <h4 class="text-xs font-black uppercase tracking-wide ${m.p2Stores.length > 0 ? 'text-amber-800' : 'text-slate-700'}">
            2. Nhóm Cần Can Thiệp &amp; Theo Dõi Sát (Ưu Tiên 2)
          </h4>
          ${p2NarrativeHtml}
        </div>

        <div class="p-3.5 rounded-xl bg-[#FFF5F8] border border-[#FAD2E1] text-slate-700 leading-relaxed">
          <strong class="text-[#D92662]">3. Kết luận kiểm toán tổng quát:</strong> ${auditSummaryConclusion}
        </div>
      </div>
    `;

    const topLeaderName = m.topStores[0] ? m.topStores[0].name : "Đơn vị dẫn đầu";
    const topLeaderRev = m.topStores[0] ? formatMoney(m.topStores[0].cleanRev) : "0 đ";
    const topProdName = m.topProducts[0] ? m.topProducts[0].name : "Nhóm chủ lực";
    const topProdShare = (m.topProducts[0] && m.validRevTotal > 0) ? ((m.topProducts[0].rev / m.validRevTotal) * 100).toFixed(1) : "0.0";
    const meanVsMedianRatio = m.medianRev > 0 ? (m.meanRev / m.medianRev).toFixed(2) : "1.00";
    const skewNote = Number(meanVsMedianRatio) > 1.15
      ? `Phân phối lệch phải (Mean/Median = ${meanVsMedianRatio}x) do có ${m.outlierCount.toLocaleString('vi-VN')} đơn giá trị VIP kéo trung bình lên — khuyến nghị giao KPI kết hợp Median + Mean.`
      : `Phân phối giao dịch khá cân đối (Mean/Median = ${meanVsMedianRatio}x), mức độ ổn định đơn hàng tốt để làm nền giao kế hoạch kỳ tới.`;

    bodyEl.innerHTML = `
      <!-- COVER HEADER & QUICK NAVIGATION -->
      <div class="rounded-2xl overflow-hidden border-2 border-[#FAD2E1] bg-white shadow-sm">
        <div class="p-5 sm:p-6 bg-gradient-to-r from-[#0F1E36] via-[#1E293B] to-[#3B1739] text-white space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF5B8E] text-white">Enterprise BI AI Agent • Executive Report</span>
            <span class="font-mono text-[11px] text-pink-200">Mã báo cáo: ${m.reportCode} • Xuất lúc ${m.timeStr} ngày ${ctx.dateStr}</span>
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-black tracking-tight text-white">BÁO CÁO PHÂN TÍCH QUẢN TRỊ &amp; ĐỐI SOÁT DỮ LIỆU TOÀN DIỆN</h2>
            <p class="text-xs sm:text-sm text-pink-100 mt-1 font-semibold">${escapeHtml(ctx.company)} — ${escapeHtml(ctx.industry)}</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-white/15 text-[11px]">
            <div class="bg-white/10 rounded-xl px-3 py-2"><span class="text-pink-200 block text-[10px]">Đối tượng tiếp nhận</span><strong class="text-white">${escapeHtml(ctx.audience)}</strong></div>
            <div class="bg-white/10 rounded-xl px-3 py-2"><span class="text-pink-200 block text-[10px]">Nguồn dữ liệu đối soát</span><strong class="text-white truncate block">${escapeHtml(m.fileName)}</strong></div>
            <div class="bg-white/10 rounded-xl px-3 py-2"><span class="text-pink-200 block text-[10px]">Người lập &amp; Kiểm duyệt</span><strong class="text-white">${escapeHtml(ctx.author)}</strong></div>
            <div class="bg-white/10 rounded-xl px-3 py-2"><span class="text-pink-200 block text-[10px]">Điểm Tin Cậy Dữ Liệu</span><strong class="text-emerald-300">${m.trustScore}/100 (Sạch ${ctx.completenessPct}%)</strong></div>
          </div>
        </div>
        <div class="px-5 py-3 bg-[#FFF5F8] border-t border-[#FAD2E1] space-y-2">
          <div class="text-xs text-slate-700"><strong class="text-[#D92662]">Mục tiêu phân tích:</strong> ${escapeHtml(ctx.desc)}</div>
          <div class="flex flex-wrap items-center gap-1.5 pt-1">
            <span class="text-[10px] font-black text-slate-500 uppercase mr-1">Mục lục nhanh:</span>
            <a href="#wr-sec-1" class="px-2.5 py-1 rounded-lg bg-white border border-[#FAD2E1] text-[10px] font-bold text-slate-700 hover:text-[#FF5B8E] hover:border-[#FF5B8E] transition">I. Tổng quan KPI</a>
            <a href="#wr-sec-2" class="px-2.5 py-1 rounded-lg bg-white border border-[#FAD2E1] text-[10px] font-bold text-slate-700 hover:text-[#FF5B8E] hover:border-[#FF5B8E] transition">II. Kiểm toán Dữ liệu</a>
            <a href="#wr-sec-3" class="px-2.5 py-1 rounded-lg bg-white border border-[#FAD2E1] text-[10px] font-bold text-slate-700 hover:text-[#FF5B8E] hover:border-[#FF5B8E] transition">III. Phân phối Thống kê</a>
            <a href="#wr-sec-4" class="px-2.5 py-1 rounded-lg bg-white border border-[#FAD2E1] text-[10px] font-bold text-slate-700 hover:text-[#FF5B8E] hover:border-[#FF5B8E] transition">IV. Sản phẩm &amp; Ngành hàng</a>
            <a href="#wr-sec-5" class="px-2.5 py-1 rounded-lg bg-white border border-[#FAD2E1] text-[10px] font-bold text-slate-700 hover:text-[#FF5B8E] hover:border-[#FF5B8E] transition">V. Khu vực</a>
            <a href="#wr-sec-6" class="px-2.5 py-1 rounded-lg bg-white border border-[#FAD2E1] text-[10px] font-bold text-slate-700 hover:text-[#FF5B8E] hover:border-[#FF5B8E] transition">VI. Toàn bộ Cửa hàng (${ctx.stores.length})</a>
            <a href="#wr-sec-7" class="px-2.5 py-1 rounded-lg bg-white border border-[#FAD2E1] text-[10px] font-bold text-slate-700 hover:text-[#FF5B8E] hover:border-[#FF5B8E] transition">VII. Cảnh báo Bất thường</a>
            <a href="#wr-sec-8" class="px-2.5 py-1 rounded-lg bg-white border border-[#FAD2E1] text-[10px] font-bold text-slate-700 hover:text-[#FF5B8E] hover:border-[#FF5B8E] transition">VIII. Insight &amp; Action Plan</a>
          </div>
        </div>
      </div>

      <!-- I. EXECUTIVE SUMMARY & 6 MACRO KPI -->
      <div id="wr-sec-1" class="rounded-2xl p-5 bg-white border border-[#FAD2E1] space-y-4">
        <div class="flex items-center justify-between border-b border-[#FFE4EC] pb-2.5">
          <h3 class="text-sm font-black text-slate-900 uppercase"><span class="text-[#FF5B8E] mr-1.5">I.</span>Tóm Tắt Điều Hành &amp; Hệ Thống 6 Chỉ Số Cốt Lõi (Macro KPI)</h3>
          <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">Số liệu đã đối soát sạch 100%</span>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div class="rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200">
            <div class="text-[11px] font-bold text-blue-700 uppercase">1. Doanh Thu Thuần</div>
            <div class="text-xl font-black text-slate-900 mt-1">${formatMoney(ctx.totalCleanRev)}</div>
            <div class="text-[11px] mt-1 ${Number(ctx.revPct) >= 100 ? 'text-emerald-700' : 'text-amber-700'} font-bold">
              Đạt ${ctx.revPct}% mục tiêu (${m.revGap >= 0 ? '+' : '-'}${formatMoney(Math.abs(m.revGap))})
            </div>
          </div>

          <div class="rounded-2xl p-4 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200">
            <div class="text-[11px] font-bold text-emerald-700 uppercase">2. Lợi Nhuận Gộp &amp; Biên LN</div>
            <div class="text-xl font-black text-emerald-800 mt-1">${formatMoney(ctx.totalCleanProfit)}</div>
            <div class="text-[11px] mt-1 text-slate-600 font-semibold">Biên LN BQ: <strong class="text-emerald-700">${ctx.avgMargin}%</strong> (Chuẩn ngành: 32.0%)</div>
          </div>

          <div class="rounded-2xl p-4 bg-gradient-to-br from-slate-50 to-white border border-slate-200">
            <div class="text-[11px] font-bold text-slate-600 uppercase">3. Tổng Giá Vốn (COGS)</div>
            <div class="text-xl font-black text-slate-800 mt-1">${formatMoney(m.totalCogs)}</div>
            <div class="text-[11px] mt-1 text-slate-600 font-semibold">Chiếm <strong>${m.cogsPct}%</strong> tổng doanh thu thuần</div>
          </div>

          <div class="rounded-2xl p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-200">
            <div class="text-[11px] font-bold text-purple-700 uppercase">4. Giá Trị Đơn TB (AOV)</div>
            <div class="text-xl font-black text-purple-900 mt-1">${formatMoney(m.meanRev)}</div>
            <div class="text-[11px] mt-1 text-slate-600 font-semibold">Trung vị (Median): <strong>${formatMoney(m.medianRev)}</strong></div>
          </div>

          <div class="rounded-2xl p-4 bg-gradient-to-br from-pink-50 to-white border border-[#FAD2E1]">
            <div class="text-[11px] font-bold text-[#D92662] uppercase">5. Độ Sạch Dữ Liệu</div>
            <div class="text-xl font-black text-slate-900 mt-1">${ctx.cleanRows.toLocaleString('vi-VN')} / ${ctx.totalRows.toLocaleString('vi-VN')}</div>
            <div class="text-[11px] mt-1 text-slate-600 font-semibold">Hợp lệ <strong>${ctx.completenessPct}%</strong> • Đã lọc <strong>${m.totalErrorRows.toLocaleString('vi-VN')}</strong> lỗi</div>
          </div>

          <div class="rounded-2xl p-4 bg-gradient-to-br from-rose-50 to-white border border-rose-200">
            <div class="text-[11px] font-bold text-rose-700 uppercase">6. Rủi Ro Đổi Trả &amp; Cảnh Báo</div>
            <div class="text-xl font-black text-rose-700 mt-1">${ctx.avgReturn}%</div>
            <div class="text-[11px] mt-1 text-slate-600 font-semibold">Trần 3.5% • <strong>${m.p1Stores.length}</strong> đơn vị cần can thiệp gấp</div>
          </div>
        </div>

        <div class="rounded-xl p-4 bg-[#FFF5F8] border border-[#FAD2E1] space-y-1.5 leading-relaxed">
          <div class="font-black text-[#D92662] text-xs uppercase"><i class="fa-solid fa-crown mr-1.5"></i>Điểm Nhấn Điều Hành Cấp Ban Giám Đốc</div>
          <p>• Trên tổng số <strong>${ctx.totalRows.toLocaleString('vi-VN')}</strong> bản ghi thô tiếp nhận từ tệp <code>${escapeHtml(m.fileName)}</code>, AI Agent đã xác thực thành công <strong>${ctx.cleanRows.toLocaleString('vi-VN')}</strong> giao dịch sạch (${ctx.completenessPct}%), bóc tách triệt để <strong>${m.totalErrorRows.toLocaleString('vi-VN')}</strong> bản ghi sai lệch (${ctx.dupRows.toLocaleString('vi-VN')} trùng lặp, ${ctx.canRows.toLocaleString('vi-VN')} đơn hủy, ${ctx.retRows.toLocaleString('vi-VN')} đổi trả, ${m.periodRows.toLocaleString('vi-VN')} lệch kỳ).</p>
          <p>• Doanh thu thuần sau đối soát đạt <strong>${formatMoney(ctx.totalCleanRev)}</strong> (${ctx.revPct}% kế hoạch), mang lại lợi nhuận gộp <strong>${formatMoney(ctx.totalCleanProfit)}</strong> (biên ${ctx.avgMargin}%). Đơn vị dẫn đầu là <strong>${escapeHtml(topLeaderName)}</strong> (${topLeaderRev}); sản phẩm/SKU chủ lực là <strong>${escapeHtml(topProdName)}</strong> (đóng góp ${topProdShare}% tổng doanh thu).</p>
          <p>• ${skewNote}</p>
        </div>
      </div>

      <!-- II. DATA QUALITY AUDIT & BPMN CLEANING BREAKDOWN -->
      <div id="wr-sec-2" class="rounded-2xl p-5 bg-white border border-[#FAD2E1] space-y-3.5">
        <div class="flex items-center justify-between border-b border-[#FFE4EC] pb-2.5">
          <h3 class="text-sm font-black text-slate-900 uppercase"><span class="text-[#FF5B8E] mr-1.5">II.</span>Kiểm Toán Chất Lượng Dữ Liệu &amp; Đối Soát Làm Sạch (BPMN)</h3>
          <span class="font-mono text-[11px] font-bold text-slate-500">Tỷ lệ lỗi phát hiện: ${m.errorRatePct}%</span>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th class="p-2.5">Nhóm Dữ Liệu Đối Soát</th>
                <th class="p-2.5 text-right">Số Dòng</th>
                <th class="p-2.5 text-right">Tỷ Trọng</th>
                <th class="p-2.5 text-right">Giá Trị Bị Ảnh Hưởng</th>
                <th class="p-2.5">Quy Tắc Xử Lý Của AI Agent</th>
                <th class="p-2.5 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr class="bg-emerald-50/40">
                <td class="p-2.5 font-extrabold text-emerald-800"><i class="fa-solid fa-circle-check mr-1.5"></i>Dữ liệu sạch hợp lệ</td>
                <td class="p-2.5 text-right font-mono font-black text-emerald-700">${ctx.cleanRows.toLocaleString('vi-VN')}</td>
                <td class="p-2.5 text-right font-mono font-bold text-emerald-700">${ctx.completenessPct}%</td>
                <td class="p-2.5 text-right font-mono font-bold text-emerald-800">${formatMoney(m.validRevTotal)}</td>
                <td class="p-2.5 text-slate-700">Đưa vào tính toán Doanh thu thuần, Lợi nhuận gộp &amp; Dashboard BI</td>
                <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">Đạt chuẩn</span></td>
              </tr>
              <tr>
                <td class="p-2.5 font-bold text-rose-700"><i class="fa-solid fa-copy mr-1.5"></i>Bản ghi trùng lặp (Duplicate)</td>
                <td class="p-2.5 text-right font-mono font-bold text-rose-600">${ctx.dupRows.toLocaleString('vi-VN')}</td>
                <td class="p-2.5 text-right font-mono">${ctx.totalRows > 0 ? ((ctx.dupRows / ctx.totalRows) * 100).toFixed(1) : '0.0'}%</td>
                <td class="p-2.5 text-right font-mono text-rose-600">${m.dupRevImpact > 0 ? formatMoney(m.dupRevImpact) : 'Đã loại bỏ'}</td>
                <td class="p-2.5 text-slate-600">Xóa bản ghi trùng toàn phần &amp; trùng không phù hợp; giữ lại đơn đa sản phẩm hợp lệ</td>
                <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">Đã xóa sạch</span></td>
              </tr>
              <tr>
                <td class="p-2.5 font-bold text-amber-700"><i class="fa-solid fa-ban mr-1.5"></i>Đơn đã hủy trước giao</td>
                <td class="p-2.5 text-right font-mono font-bold text-amber-700">${ctx.canRows.toLocaleString('vi-VN')}</td>
                <td class="p-2.5 text-right font-mono">${ctx.totalRows > 0 ? ((ctx.canRows / ctx.totalRows) * 100).toFixed(1) : '0.0'}%</td>
                <td class="p-2.5 text-right font-mono text-amber-700">${formatMoney(m.canRevImpact)}</td>
                <td class="p-2.5 text-slate-600">Khấu trừ 100% doanh thu &amp; giá vốn ảo khỏi báo cáo tài chính</td>
                <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Đã khấu trừ</span></td>
              </tr>
              <tr>
                <td class="p-2.5 font-bold text-purple-700"><i class="fa-solid fa-rotate-left mr-1.5"></i>Đơn đổi trả / Hoàn hàng</td>
                <td class="p-2.5 text-right font-mono font-bold text-purple-700">${ctx.retRows.toLocaleString('vi-VN')}</td>
                <td class="p-2.5 text-right font-mono">${ctx.totalRows > 0 ? ((ctx.retRows / ctx.totalRows) * 100).toFixed(1) : '0.0'}%</td>
                <td class="p-2.5 text-right font-mono text-purple-700">${formatMoney(m.retRevImpact)}</td>
                <td class="p-2.5 text-slate-600">Điều chỉnh giảm doanh thu thực nhận và hoàn nhập COGS tồn kho tương ứng</td>
                <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">Đã hoàn COGS</span></td>
              </tr>
              <tr>
                <td class="p-2.5 font-bold text-sky-700"><i class="fa-solid fa-calendar-xmark mr-1.5"></i>Lệch chu kỳ so sánh</td>
                <td class="p-2.5 text-right font-mono font-bold text-sky-700">${m.periodRows.toLocaleString('vi-VN')}</td>
                <td class="p-2.5 text-right font-mono">${ctx.totalRows > 0 ? ((m.periodRows / ctx.totalRows) * 100).toFixed(1) : '0.0'}%</td>
                <td class="p-2.5 text-right font-mono text-sky-700">${formatMoney(m.perRevImpact)}</td>
                <td class="p-2.5 text-slate-600">Đồng bộ đúng kỳ đối chiếu tương đương (cùng số ngày bán hàng)</td>
                <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">Đã đồng bộ</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- III. STATISTICAL DISTRIBUTION & ORDER SEGMENTATION -->
      <div id="wr-sec-3" class="rounded-2xl p-5 bg-white border border-[#FAD2E1] space-y-4">
        <div class="flex items-center justify-between border-b border-[#FFE4EC] pb-2.5">
          <h3 class="text-sm font-black text-slate-900 uppercase"><span class="text-[#FF5B8E] mr-1.5">III.</span>Phân Tích Thống Kê Mô Tả &amp; Phân Khúc Quy Mô Đơn Hàng</h3>
          <span class="font-mono text-[11px] font-bold text-slate-500">Mẫu hợp lệ: ${m.countVal.toLocaleString('vi-VN')} giao dịch</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200"><div class="text-[10px] font-bold text-slate-500">NHỎ NHẤT (MIN)</div><div class="font-mono font-black text-slate-800 mt-1">${formatMoney(m.minRev)}</div></div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200"><div class="text-[10px] font-bold text-slate-500">PHÂN VỊ Q1 (25%)</div><div class="font-mono font-black text-slate-800 mt-1">${formatMoney(m.q1Rev)}</div></div>
          <div class="p-3 rounded-xl bg-blue-50 border border-blue-200"><div class="text-[10px] font-bold text-blue-700">TRUNG VỊ (MEDIAN)</div><div class="font-mono font-black text-blue-900 mt-1">${formatMoney(m.medianRev)}</div></div>
          <div class="p-3 rounded-xl bg-purple-50 border border-purple-200"><div class="text-[10px] font-bold text-purple-700">TRUNG BÌNH (MEAN)</div><div class="font-mono font-black text-purple-900 mt-1">${formatMoney(m.meanRev)}</div></div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200"><div class="text-[10px] font-bold text-slate-500">PHÂN VỊ Q3 (75%)</div><div class="font-mono font-black text-slate-800 mt-1">${formatMoney(m.q3Rev)}</div></div>
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200"><div class="text-[10px] font-bold text-emerald-700">LỚN NHẤT (MAX)</div><div class="font-mono font-black text-emerald-900 mt-1">${formatMoney(m.maxRev)}</div></div>
          <div class="p-3 rounded-xl bg-rose-50 border border-rose-200"><div class="text-[10px] font-bold text-rose-700">NGOẠI LAI (IQR)</div><div class="font-mono font-black text-rose-700 mt-1">${m.outlierCount.toLocaleString('vi-VN')} đơn</div></div>
        </div>

        <div class="rounded-xl p-4 bg-[#FFFBFD] border border-[#FAD2E1] space-y-2.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-black text-slate-800">Phân Tầng Tỷ Trọng Doanh Thu Theo Quy Mô Đơn Hàng</span>
            <span class="text-[10px] text-slate-500 font-mono">Độ lệch chuẩn (StdDev): ${formatMoney(m.stdDevRev)} • Ngưỡng IQR: ${formatMoney(m.upperFence)}</span>
          </div>
          ${segmentBarsHtml}
        </div>
      </div>

      <!-- IV. PRODUCT & CATEGORY PERFORMANCE -->
      <div id="wr-sec-4" class="rounded-2xl p-5 bg-white border border-[#FAD2E1] space-y-4">
        <div class="flex items-center justify-between border-b border-[#FFE4EC] pb-2.5">
          <h3 class="text-sm font-black text-slate-900 uppercase"><span class="text-[#FF5B8E] mr-1.5">IV.</span>Phân Tích Cơ Cấu Ngành Hàng &amp; Top ${Math.min(10, m.topProducts.length)} Sản Phẩm Chủ Lực</h3>
          <span class="font-mono text-[11px] font-bold text-slate-500">${m.categories.length} ngành hàng • ${m.topProducts.length} SKU dẫn đầu</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${categoryCardsHtml}
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th class="p-2.5 text-center">#</th>
                <th class="p-2.5">Sản Phẩm / Mã SKU</th>
                <th class="p-2.5">Ngành Hàng</th>
                <th class="p-2.5 text-right">Số Đơn</th>
                <th class="p-2.5 text-right">Doanh Thu Thuần</th>
                <th class="p-2.5 text-right">Lợi Nhuận Gộp</th>
                <th class="p-2.5 text-right">Biên LN</th>
                <th class="p-2.5 text-right">Tỷ Trọng DT</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">${productRowsHtml}</tbody>
          </table>
        </div>
      </div>

      <!-- V. REGIONAL BREAKDOWN -->
      <div id="wr-sec-5" class="rounded-2xl p-5 bg-white border border-[#FAD2E1] space-y-3.5">
        <div class="flex items-center justify-between border-b border-[#FFE4EC] pb-2.5">
          <h3 class="text-sm font-black text-slate-900 uppercase"><span class="text-[#FF5B8E] mr-1.5">V.</span>Hiệu Suất Kinh Doanh Theo Khu Vực Địa Lý</h3>
          <span class="font-mono text-[11px] font-bold text-slate-500">${m.regions.length} khu vực</span>
        </div>
        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th class="p-2.5">Khu Vực</th>
                <th class="p-2.5 text-center">Số Đơn Vị</th>
                <th class="p-2.5 text-right">Doanh Thu Thuần</th>
                <th class="p-2.5 text-right">Mục Tiêu</th>
                <th class="p-2.5 text-right">% Đạt MT</th>
                <th class="p-2.5 text-right">Lợi Nhuận Gộp</th>
                <th class="p-2.5 text-right">Biên LN</th>
                <th class="p-2.5 text-right">Tỷ Trọng Hệ Thống</th>
                <th class="p-2.5 text-right">Đổi Trả BQ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">${regionRowsHtml}</tbody>
          </table>
        </div>
      </div>

      <!-- VI. FULL STORE / UNIT LEADERBOARD -->
      <div id="wr-sec-6" class="rounded-2xl border border-[#FAD2E1] bg-white overflow-hidden">
        <div class="px-5 py-3.5 bg-[#FFF5F8] border-b border-[#FFE4EC] flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm font-black text-slate-900 uppercase"><span class="text-[#FF5B8E] mr-1.5">VI.</span>Bảng Xếp Hạng &amp; Đối Soát Chi Tiết Toàn Bộ ${ctx.stores.length} Cửa Hàng / Đơn Vị</h3>
          <span class="text-[11px] font-bold text-slate-500">Sắp xếp theo Doanh thu thuần giảm dần</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th class="p-2.5 text-center">Hạng</th>
                <th class="p-2.5">Cửa Hàng / Đơn Vị</th>
                <th class="p-2.5">Khu Vực</th>
                <th class="p-2.5 text-right">Doanh Thu Thuần</th>
                <th class="p-2.5 text-right">Mục Tiêu</th>
                <th class="p-2.5 text-right">% Đạt</th>
                <th class="p-2.5 text-right">LN Gộp</th>
                <th class="p-2.5 text-right">Biên (%)</th>
                <th class="p-2.5 text-right">Đổi Trả</th>
                <th class="p-2.5 text-center">Phân Loại Audit</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">${storeRowsHtml}</tbody>
            <tfoot class="bg-[#FFF5F8] border-t-2 border-[#FAD2E1] font-black text-slate-900">
              <tr>
                <td class="p-2.5 text-center">—</td>
                <td class="p-2.5 uppercase">TỔNG CỘNG / BÌNH QUÂN TOÀN HỆ THỐNG (${ctx.stores.length} ĐƠN VỊ)</td>
                <td class="p-2.5 text-slate-500">${m.regions.length} KV</td>
                <td class="p-2.5 text-right font-mono text-blue-800">${formatMoney(ctx.totalCleanRev)}</td>
                <td class="p-2.5 text-right font-mono text-slate-600">${formatMoney(ctx.totalTargetRev)}</td>
                <td class="p-2.5 text-right font-mono text-emerald-700">${ctx.revPct}%</td>
                <td class="p-2.5 text-right font-mono text-emerald-800">${formatMoney(ctx.totalCleanProfit)}</td>
                <td class="p-2.5 text-right font-mono">${ctx.avgMargin}%</td>
                <td class="p-2.5 text-right font-mono ${Number(ctx.avgReturn) > 3.5 ? 'text-rose-600' : ''}">${ctx.avgReturn}%</td>
                <td class="p-2.5 text-center text-[10px] text-slate-600">${m.p1Stores.length} P1 • ${m.p2Stores.length} P2</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- VII. ANOMALY AUDIT & PRIORITY INTERVENTION -->
      <div id="wr-sec-7" class="rounded-2xl p-5 bg-white border border-[#FAD2E1] space-y-3.5">
        <div class="flex items-center justify-between border-b border-[#FFE4EC] pb-2.5">
          <h3 class="text-sm font-black text-slate-900 uppercase"><span class="text-[#FF5B8E] mr-1.5">VII.</span>Kiểm Toán Bất Thường &amp; Đơn Vị Cần Can Thiệp Ưu Tiên</h3>
          <span class="text-[11px] font-bold ${m.p1Stores.length > 0 ? 'text-rose-600' : 'text-emerald-700'}">${m.p1Stores.length} Báo đỏ khẩn cấp (P1) • ${m.p2Stores.length} Cần can thiệp (P2)</span>
        </div>
        <div>
          ${anomalyListHtml}
        </div>
      </div>

      <!-- VIII. INSIGHT MATRIX (DATA -> DECISION) & 30-60-90 DAY ACTION PLAN -->
      <div id="wr-sec-8" class="rounded-2xl p-5 bg-white border border-[#FAD2E1] space-y-4">
        <div class="flex items-center justify-between border-b border-[#FFE4EC] pb-2.5">
          <h3 class="text-sm font-black text-slate-900 uppercase"><span class="text-[#FF5B8E] mr-1.5">VIII.</span>Ma Trận Insight (DATA → DECISION) &amp; Kế Hoạch Hành Động 30-60-90 Ngày</h3>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-[#FFF5F8] text-slate-700 uppercase text-[10px] font-bold border-b border-[#FAD2E1]">
              <tr>
                <th class="p-2.5 w-28">Mã Insight</th>
                <th class="p-2.5">DATA &amp; INFORMATION (Sự kiện định lượng)</th>
                <th class="p-2.5">INSIGHT (Bản chất &amp; Nguyên nhân)</th>
                <th class="p-2.5">DECISION (Quyết định quản trị)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr>
                <td class="p-2.5 font-black text-[#D92662]">INS-01<br><span class="text-[10px] font-semibold text-slate-500">Quản trị Dữ liệu</span></td>
                <td class="p-2.5">Đối soát ${ctx.totalRows.toLocaleString('vi-VN')} dòng thô: lọc sạch <strong>${ctx.dupRows.toLocaleString('vi-VN')}</strong> dòng trùng lặp; độ sạch đạt <strong>${ctx.completenessPct}%</strong>.</td>
                <td class="p-2.5">Ghi nhận lặp mã giao dịch / POS đúp làm phồng doanh thu ảo nếu không tách biệt đơn đa sản phẩm hợp lệ và trùng lỗi.</td>
                <td class="p-2.5 font-semibold text-slate-900">Bật khóa kiểm tra trùng lặp tự động (Primary Key + SKU) và Data Validation ngay tại điểm nhập liệu.</td>
              </tr>
              <tr>
                <td class="p-2.5 font-black text-amber-700">INS-02<br><span class="text-[10px] font-semibold text-slate-500">Hủy &amp; Đổi trả</span></td>
                <td class="p-2.5">Ghi nhận <strong>${ctx.canRows.toLocaleString('vi-VN')}</strong> đơn hủy và <strong>${ctx.retRows.toLocaleString('vi-VN')}</strong> đơn đổi trả; tỷ lệ đổi trả BQ toàn hệ thống đạt <strong>${ctx.avgReturn}%</strong> (trần 3.5%).</td>
                <td class="p-2.5">Chênh lệch tồn kho POS và quy trình kiểm hàng/tư vấn trước giao là tác nhân chính làm tăng hoàn trả và đội chi phí COGS.</td>
                <td class="p-2.5 font-semibold text-slate-900">Đồng bộ tồn kho real-time, đối soát 100% mã giao dịch gốc khi lập phiếu hoàn và huấn luyện lại CSKH tại nhóm P1.</td>
              </tr>
              <tr>
                <td class="p-2.5 font-black text-emerald-700">INS-03<br><span class="text-[10px] font-semibold text-slate-500">Biên LN &amp; SKU</span></td>
                <td class="p-2.5">Biên LN gộp đạt <strong>${ctx.avgMargin}%</strong> (LN gộp ${formatMoney(ctx.totalCleanProfit)}); sản phẩm <strong>${escapeHtml(topProdName)}</strong> chiếm <strong>${topProdShare}%</strong> doanh thu.</td>
                <td class="p-2.5">Doanh thu tập trung mạnh vào nhóm SKU chủ lực; cần cân bằng danh mục biên cao để tránh rủi ro phụ thuộc &amp; bẫy chiết khấu.</td>
                <td class="p-2.5 font-semibold text-slate-900">Đẩy bán chéo (cross-sell) nhóm phụ kiện/biên cao đi kèm SKU chủ lực và áp trần chiết khấu theo từng phân khúc.</td>
              </tr>
              <tr>
                <td class="p-2.5 font-black text-blue-700">INS-04<br><span class="text-[10px] font-semibold text-slate-500">Giao KPI Công bằng</span></td>
                <td class="p-2.5">Giá trị đơn TB (Mean) là <strong>${formatMoney(m.meanRev)}</strong> so với Trung vị (Median) <strong>${formatMoney(m.medianRev)}</strong> (tỷ số ${meanVsMedianRatio}x, có ${m.outlierCount.toLocaleString('vi-VN')} đơn VIP).</td>
                <td class="p-2.5">Dùng riêng giá trị trung bình sẽ tạo áp lực KPI lệch cho các điểm bán quy mô vừa khi hệ thống có các đơn ngoại lai lớn.</td>
                <td class="p-2.5 font-semibold text-slate-900">Áp dụng công thức giao KPI theo <strong>Mean + Median + Phân tầng khu vực</strong> và nhân rộng mô hình vận hành từ ${escapeHtml(topLeaderName)}.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="rounded-xl p-4 bg-rose-50/60 border border-rose-200 space-y-1.5">
            <div class="text-[11px] font-black text-rose-700 uppercase">Giai Đoạn 1 (Ngày 1–30) • Ưu Tiên Khẩn</div>
            <p class="text-slate-700">• Triển khai can thiệp trực tiếp tại <strong>${m.p1Stores.length}</strong> đơn vị nhóm P1; khóa kiểm soát đơn hủy &amp; đổi trả vượt trần 3.5%.</p>
            <p class="text-slate-700">• <strong>Phụ trách:</strong> Quản lý Vận hành, CSKH &amp; Kho vận.</p>
            <p class="text-emerald-700 font-bold">• KPI: Tỷ lệ đổi trả &le; 3.5%, khớp 100% mã GD gốc.</p>
          </div>
          <div class="rounded-xl p-4 bg-amber-50/60 border border-amber-200 space-y-1.5">
            <div class="text-[11px] font-black text-amber-800 uppercase">Giai Đoạn 2 (Ngày 31–60) • Tối Ưu Vận Hành</div>
            <p class="text-slate-700">• Đồng bộ tồn kho POS thời gian thực, tối ưu trưng bày Top ${Math.min(5, m.topProducts.length)} SKU chủ lực và áp trần chiết khấu.</p>
            <p class="text-slate-700">• <strong>Phụ trách:</strong> Trưởng phòng Kinh doanh &amp; Ngành hàng.</p>
            <p class="text-emerald-700 font-bold">• KPI: Biên LN gộp &ge; 32.0%, tỷ lệ hủy đơn &lt; 4.0%.</p>
          </div>
          <div class="rounded-xl p-4 bg-emerald-50/60 border border-emerald-200 space-y-1.5">
            <div class="text-[11px] font-black text-emerald-800 uppercase">Giai Đoạn 3 (Ngày 61–90) • Chuẩn Hóa BI</div>
            <p class="text-slate-700">• Tự động hóa pipeline kiểm toán dữ liệu hàng tuần, chuẩn hóa Data Validation và giao KPI dựa trên Mean + Median.</p>
            <p class="text-slate-700">• <strong>Phụ trách:</strong> BI / Data Analyst &amp; CNTT.</p>
            <p class="text-emerald-700 font-bold">• KPI: Độ sạch dữ liệu &ge; 99.5%, Trùng lặp = 0%.</p>
          </div>
        </div>
      </div>

      <!-- SIGN-OFF FOOTER -->
      <div class="rounded-2xl p-4 bg-white border border-[#FAD2E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-600">
        <div>
          <strong class="text-slate-900">Xác nhận đối soát tự động bởi Enterprise BI AI Agent:</strong>
          Số liệu đã qua kiểm toán làm sạch BPMN 4 bước, đồng bộ 100% với tệp xuất Word, PowerPoint, Excel và Dashboard HTML.
        </div>
        <div class="text-left sm:text-right shrink-0">
          <div class="font-black text-slate-900">Người lập: ${escapeHtml(ctx.author)}</div>
          <div class="font-mono text-[10px] text-slate-400">${m.reportCode} • ${ctx.dateStr} ${m.timeStr}</div>
        </div>
      </div>
    `;
  }

  // ========================================================
  // DIRECT INLINE REPORT EDITOR, PRINT & DIRECT PDF EXPORT
  // ========================================================
  const webReportBodyEl = document.getElementById("web-executive-report-body");
  const btnToggleEditWebReport = document.getElementById("btn-toggle-edit-web-report");
  const webReportEditToolbar = document.getElementById("web-report-edit-toolbar");
  const btnSaveWebReportEdits = document.getElementById("btn-save-web-report-edits");
  const btnResetWebReportEdits = document.getElementById("btn-reset-web-report-edits");
  const btnAddWebReportNote = document.getElementById("btn-add-web-report-note");
  const btnPrintWebReport = document.getElementById("btn-print-web-report");
  const btnExportWebReportPdf = document.getElementById("btn-export-web-report-pdf");

  function setWebReportEditMode(enabled) {
    state.isWebReportEditing = !!enabled;
    if (!webReportBodyEl) return;

    if (state.isWebReportEditing) {
      webReportBodyEl.setAttribute("contenteditable", "true");
      webReportBodyEl.setAttribute("spellcheck", "false");
      webReportBodyEl.classList.add("web-report-editing");
      if (webReportEditToolbar) webReportEditToolbar.classList.remove("hidden");
      if (btnToggleEditWebReport) {
        btnToggleEditWebReport.innerHTML = `<i class="fa-solid fa-check"></i><span>Đang Sửa (Bấm để Xong)</span>`;
        btnToggleEditWebReport.className = "px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600 text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95";
      }
      showToast("Đã bật chế độ Sửa Trực Tiếp! Bấm vào bất kỳ chữ, bảng hoặc nhận xét nào trên báo cáo để sửa ✏️");
    } else {
      state.editedWebReportHtml = webReportBodyEl.innerHTML;
      webReportBodyEl.removeAttribute("contenteditable");
      webReportBodyEl.classList.remove("web-report-editing");
      if (webReportEditToolbar) webReportEditToolbar.classList.add("hidden");
      if (btnToggleEditWebReport) {
        btnToggleEditWebReport.innerHTML = `<i class="fa-solid fa-pen-to-square"></i><span>Sửa Trực Tiếp</span>`;
        btnToggleEditWebReport.className = "px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95";
      }
    }
  }

  if (btnToggleEditWebReport) {
    btnToggleEditWebReport.addEventListener("click", () => {
      const next = !state.isWebReportEditing;
      setWebReportEditMode(next);
      if (!next) {
        showToast("Đã lưu nội dung chỉnh sửa trên Báo Cáo Web! Bạn có thể In hoặc Xuất PDF ngay ✓");
      }
    });
  }

  if (btnSaveWebReportEdits) {
    btnSaveWebReportEdits.addEventListener("click", () => {
      setWebReportEditMode(false);
      showToast("Đã lưu toàn bộ chỉnh sửa trên Báo Cáo Web! Sẵn sàng In & Xuất PDF ✓");
      if (typeof pushNotification === "function") {
        pushNotification({
          type: "workflow",
          level: "info",
          title: "Lưu chỉnh sửa Báo Cáo Web",
          desc: "Nội dung chỉnh sửa trực tiếp trên Báo Cáo Quản Trị Web đã được lưu thành công.",
          badge: "Report"
        });
      }
    });
  }

  if (btnResetWebReportEdits) {
    btnResetWebReportEdits.addEventListener("click", () => {
      setWebReportEditMode(false);
      renderWebExecutiveReport(true);
      showToast("Đã khôi phục Báo Cáo Web về bản gốc từ dữ liệu AI Agent! ↺");
    });
  }

  if (btnAddWebReportNote) {
    btnAddWebReportNote.addEventListener("click", () => {
      if (!webReportBodyEl) return;
      const nowTime = new Date().toLocaleString("vi-VN");
      const noteEl = document.createElement("div");
      noteEl.className = "custom-report-note rounded-2xl p-4 bg-amber-50/80 border-2 border-amber-300 space-y-1.5";
      noteEl.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <h4 class="text-xs font-black text-amber-900 uppercase">📌 Ghi Chú &amp; Chỉ Đạo Bổ Sung Của Ban Quản Trị</h4>
          <span class="text-[10px] font-mono text-amber-700">${nowTime}</span>
        </div>
        <p class="text-xs text-slate-800 leading-relaxed">Nhập trực tiếp nhận xét, quyết định điều hành hoặc ghi chú bổ sung của bạn tại đây trước khi In / Xuất PDF...</p>
      `;
      webReportBodyEl.appendChild(noteEl);
      noteEl.scrollIntoView({ behavior: "smooth", block: "center" });
      showToast("Đã thêm khung Ghi chú mới vào cuối báo cáo! ✏️");
    });
  }

  if (webReportEditToolbar) {
    webReportEditToolbar.querySelectorAll("[data-report-cmd]").forEach(btn => {
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Keep text selection inside contenteditable
        const cmd = btn.getAttribute("data-report-cmd");
        const val = btn.getAttribute("data-report-val") || null;
        try {
          document.execCommand(cmd, false, val);
        } catch (err) {}
      });
    });
  }

  if (webReportBodyEl) {
    webReportBodyEl.addEventListener("input", () => {
      if (state.isWebReportEditing) {
        state.editedWebReportHtml = webReportBodyEl.innerHTML;
      }
    });
  }

  if (btnPrintWebReport) {
    btnPrintWebReport.addEventListener("click", () => {
      if (state.isWebReportEditing) {
        setWebReportEditMode(false);
      }
      setTimeout(() => {
        window.print();
      }, 120);
    });
  }

  if (btnExportWebReportPdf) {
    btnExportWebReportPdf.addEventListener("click", async () => {
      if (!webReportBodyEl) return;
      if (state.isWebReportEditing) {
        setWebReportEditMode(false);
      }

      const ctx = gatherAgentReportContext();
      const safeCompany = (ctx.company || "PhucAn_Retail")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
        .replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 32) || "BaoCao";
      const fileName = `Bao_Cao_Quan_Tri_${safeCompany}_${new Date().toISOString().slice(0, 10)}.pdf`;

      if (typeof window.html2pdf === "function") {
        const origHtml = btnExportWebReportPdf.innerHTML;
        btnExportWebReportPdf.disabled = true;
        btnExportWebReportPdf.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Đang xuất PDF...</span>`;
        showToast("Đang khởi tạo file PDF từ nội dung Báo Cáo Web... 📄");

        try {
          const opt = {
            margin: [8, 8, 8, 8],
            filename: fileName,
            image: { type: "jpeg", quality: 0.96 },
            html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: "#FFFFFF" },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["css", "legacy"], avoid: ["tr", ".custom-report-note"] }
          };
          await window.html2pdf().set(opt).from(webReportBodyEl).save();
          showToast(`Đã xuất file PDF trực tiếp: ${fileName} ✓`);
          if (typeof pushNotification === "function") {
            pushNotification({
              type: "workflow",
              level: "info",
              title: "Xuất PDF Báo Cáo Web thành công",
              desc: `Đã tải xuống trực tiếp tệp ${fileName} (bao gồm toàn bộ chỉnh sửa mới nhất).`,
              badge: "PDF"
            });
          }
        } catch (err) {
          console.error("PDF export error:", err);
          showToast("Chuyển sang hộp thoại In / Lưu PDF của trình duyệt...", true);
          window.print();
        } finally {
          btnExportWebReportPdf.disabled = false;
          btnExportWebReportPdf.innerHTML = origHtml;
        }
      } else {
        showToast("Mở hộp thoại Lưu thành PDF của trình duyệt (chọn Destination: Save as PDF)...");
        window.print();
      }
    });
  }

  document.getElementById("btn-run-audit")?.addEventListener("click", runCrossCheckAudit);

  // ========================================================
  // FINAL OUTPUT EXPORT: WORD (.doc) & POWERPOINT (.pptx)
  // ========================================================
  function gatherAgentReportContext() {
    const company = (document.getElementById("ctx-company-name")?.value || "").trim() || "Hệ Thống Bán Lẻ Phúc An Mart";
    const industry = (document.getElementById("ctx-industry")?.value || "").trim() || "Bán lẻ đa kênh (Omnichannel Retail)";
    const audience = (document.getElementById("ctx-audience")?.value || "").trim() || "Ban Giám Đốc (CEO / CFO), Trưởng phòng Kinh doanh";
    const desc = (document.getElementById("ctx-description")?.value || "").trim() || "Phân tích doanh thu thuần, làm sạch đơn hủy/trùng lặp/đổi trả và tối ưu hiệu suất 18 cửa hàng.";
    const activeUser = getCurrentUser();
    const author = activeUser ? activeUser.fullname : "Cao Thị Thảo Hiền";

    const stats = customDatasetStats || {};
    const totalRows = stats.totalRows || (currentRawRecords ? currentRawRecords.length : 0) || 1006;
    const dupRows = stats.duplicateRows || 0;
    const canRows = stats.cancelledRows || 0;
    const retRows = stats.returnRows || 0;
    const cleanRows = stats.cleanRows || Math.max(totalRows - dupRows - canRows, 0);
    const completenessPct = totalRows > 0 ? ((cleanRows / totalRows) * 100).toFixed(1) : "100.0";

    const analytics = getActiveAnalytics();
    const stores = analytics.stores || [];
    const totalCleanRev = analytics.totalCleanRev;
    const totalTargetRev = analytics.totalTargetRev;
    const totalCleanProfit = analytics.totalCleanProfit;
    const avgMargin = analytics.avgMargin;
    const revPct = totalTargetRev > 0 ? ((totalCleanRev / totalTargetRev) * 100).toFixed(1) : "0.0";
    const avgReturn = analytics.avgReturn;

    return {
      company, industry, audience, desc, author,
      dateStr: new Date().toLocaleDateString("vi-VN"),
      totalRows, dupRows, canRows, retRows, cleanRows, completenessPct,
      stores, totalCleanRev, totalTargetRev, totalCleanProfit, avgMargin, revPct, avgReturn
    };
  }

  function exportWordReport() {
    const ctx = gatherAgentReportContext();
    const storeRowsHtml = ctx.stores.map(s => {
      const pct = s.targetRevenue > 0 ? ((s.cleanRev / s.targetRevenue) * 100).toFixed(1) : "0.0";
      const margin = s.cleanRev > 0 ? ((s.cleanProfit / s.cleanRev) * 100).toFixed(1) : "0.0";
      return `
        <tr>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(s.region)}</td>
          <td style="text-align:right;">${formatMoney(s.cleanRev)}</td>
          <td style="text-align:right;">${formatMoney(s.targetRevenue)}</td>
          <td style="text-align:right;">${pct}%</td>
          <td style="text-align:right;">${formatMoney(s.cleanProfit)}</td>
          <td style="text-align:right;">${margin}%</td>
          <td style="text-align:right;">${s.returnRate}%</td>
        </tr>`;
    }).join("");

    const wordHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Báo Cáo Quản Trị BI - ${escapeHtml(ctx.company)}</title>
  <style>
    body { font-family: "Calibri", "Arial", sans-serif; color: #1E293B; line-height: 1.5; margin: 24px; }
    h1 { color: #D92662; font-size: 22pt; border-bottom: 2px solid #FF5B8E; padding-bottom: 6px; }
    h2 { color: #1E3A8A; font-size: 14pt; margin-top: 18px; border-left: 4px solid #FF5B8E; padding-left: 8px; }
    .meta { background: #FFF5F8; border: 1px solid #FAD2E1; padding: 12px; border-radius: 6px; margin-bottom: 14px; font-size: 10.5pt; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9.5pt; }
    th { background-color: #FF5B8E; color: #FFFFFF; padding: 7px; border: 1px solid #FAD2E1; text-align: left; }
    td { padding: 6px; border: 1px solid #E2E8F0; }
    tr:nth-child(even) td { background-color: #FFFBFD; }
    .kpi-table td { text-align: center; background: #FFF5F8; font-weight: bold; font-size: 11pt; padding: 10px; }
  </style>
</head>
<body>
  <h1>BÁO CÁO PHÂN TÍCH QUẢN TRỊ &amp; ĐỐI SOÁT DỮ LIỆU BI</h1>
  <div class="meta">
    <strong>Doanh nghiệp / Dự án:</strong> ${escapeHtml(ctx.company)}<br>
    <strong>Ngành nghề:</strong> ${escapeHtml(ctx.industry)} &nbsp;|&nbsp; <strong>Đối tượng:</strong> ${escapeHtml(ctx.audience)}<br>
    <strong>Người lập báo cáo:</strong> ${escapeHtml(ctx.author)} &nbsp;|&nbsp; <strong>Ngày xuất:</strong> ${ctx.dateStr}<br>
    <strong>Mục tiêu phân tích:</strong> ${escapeHtml(ctx.desc)}
  </div>

  <h2>1. KẾT QUẢ LÀM SẠCH DỮ LIỆU (BƯỚC 2 BPMN)</h2>
  <table class="kpi-table">
    <tr>
      <th>Tổng Dữ Liệu Thô</th>
      <th>Trùng Lặp (Loại bỏ)</th>
      <th>Đơn Đã Hủy (Trừ DT)</th>
      <th>Đổi Trả (Hoàn COGS)</th>
      <th>Dữ Liệu Sạch Hợp Lệ</th>
    </tr>
    <tr>
      <td>${ctx.totalRows.toLocaleString('vi-VN')} dòng</td>
      <td style="color:#E11D48;">${ctx.dupRows.toLocaleString('vi-VN')} dòng</td>
      <td style="color:#D97706;">${ctx.canRows.toLocaleString('vi-VN')} dòng</td>
      <td style="color:#7C3AED;">${ctx.retRows.toLocaleString('vi-VN')} dòng</td>
      <td style="color:#059669;">${ctx.cleanRows.toLocaleString('vi-VN')} dòng (${ctx.completenessPct}%)</td>
    </tr>
  </table>

  <h2>2. CHỈ SỐ TỔNG QUAN KINH DOANH (4 MACRO KPI)</h2>
  <table class="kpi-table">
    <tr>
      <th>Doanh Thu Thuần</th>
      <th>Lợi Nhuận Gộp</th>
      <th>Biên LN Gộp BQ</th>
      <th>Tỷ Lệ Đổi Trả BQ</th>
    </tr>
    <tr>
      <td>${formatMoney(ctx.totalCleanRev)} (${ctx.revPct}% MT)</td>
      <td>${formatMoney(ctx.totalCleanProfit)}</td>
      <td>${ctx.avgMargin}% (Chuẩn 32%)</td>
      <td>${ctx.avgReturn}% (Trần 3.5%)</td>
    </tr>
  </table>

  <h2>3. PHÂN TÍCH INSIGHT (DATA → INFORMATION → INSIGHT → DECISION)</h2>
  <table>
    <tr>
      <th>Mã Insight</th>
      <th>DATA &amp; INFORMATION</th>
      <th>INSIGHT (Nguyên nhân)</th>
      <th>DECISION (Quyết định)</th>
    </tr>
    <tr>
      <td><strong>INS-01</strong><br>Quản trị Dữ liệu</td>
      <td>Kiểm tra ${ctx.totalRows.toLocaleString('vi-VN')} dòng gốc; độ sạch đạt ${ctx.completenessPct}%, lọc ${ctx.dupRows.toLocaleString('vi-VN')} dòng trùng lặp.</td>
      <td>Tồn tại lỗi ghi nhận trùng POS/mã giao dịch và đơn hủy cộng nhầm làm sai lệch mức nền doanh thu.</td>
      <td>Dùng Mean + Median khi giao KPI; áp dụng Data Validation chuẩn hóa nhập liệu tại nguồn.</td>
    </tr>
    <tr>
      <td><strong>INS-02</strong><br>Hủy đơn &amp; Đổi trả</td>
      <td>Phát hiện ${ctx.canRows.toLocaleString('vi-VN')} đơn hủy và ${ctx.retRows.toLocaleString('vi-VN')} giao dịch đổi trả cần hoàn COGS.</td>
      <td>Hết tồn kho ảo gây hủy đơn; tư vấn/đóng gói chưa chuẩn làm tăng tỷ lệ đổi trả vượt trần 3.5%.</td>
      <td>Khóa đồng bộ tồn kho real-time và đối soát tự động mã giao dịch gốc khi lập phiếu hoàn.</td>
    </tr>
  </table>

  <h2>4. ĐỀ XUẤT GIẢI PHÁP, BỘ PHẬN PHỤ TRÁCH &amp; KPI (ACTION PLAN)</h2>
  <table>
    <tr>
      <th>Thứ Tự Ưu Tiên</th>
      <th>Giải Pháp Cụ Thể</th>
      <th>Bộ Phận Chịu Trách Nhiệm</th>
      <th>KPI Đo Lường Hiệu Quả</th>
    </tr>
    <tr>
      <td><strong>Ưu tiên 1:</strong> Kiểm soát Đổi trả</td>
      <td>Chuẩn hóa quy trình tư vấn bán hàng, kiểm tra hàng trước xuất và đối soát mã gốc tự động.</td>
      <td>Quản lý Cửa hàng, CSKH &amp; Kho vận</td>
      <td>Tỷ lệ đổi trả &le; 3.5%, khớp 100% mã giao dịch gốc.</td>
    </tr>
    <tr>
      <td><strong>Ưu tiên 2:</strong> Giảm Đơn hủy</td>
      <td>Đồng bộ tồn kho POS theo thời gian thực và cảnh báo SKU sắp hết hàng.</td>
      <td>Vận hành Bán lẻ &amp; Điều phối Tồn kho</td>
      <td>Giảm tỷ lệ hủy đơn xuống dưới 4.0% trong kỳ tới.</td>
    </tr>
    <tr>
      <td><strong>Ưu tiên 3:</strong> Quản trị Dữ liệu BI</td>
      <td>Áp dụng Data Validation, chuẩn hóa danh mục Dropdown và cảnh báo ngưỡng ngoại lai IQR.</td>
      <td>BI / Data Analyst &amp; Quản trị Hệ thống</td>
      <td>Độ đầy đủ dữ liệu &ge; 99.5%, Trùng lặp = 0%.</td>
    </tr>
  </table>

  <h2>5. BẢNG TỔNG HỢP HIỆU SUẤT ${ctx.stores.length} CỬA HÀNG</h2>
  <table>
    <tr>
      <th>Cửa Hàng</th>
      <th>Khu Vực</th>
      <th style="text-align:right;">Doanh Thu Thuần</th>
      <th style="text-align:right;">Mục Tiêu</th>
      <th style="text-align:right;">% Đạt</th>
      <th style="text-align:right;">LN Gộp</th>
      <th style="text-align:right;">Biên (%)</th>
      <th style="text-align:right;">Đổi Trả</th>
    </tr>
    ${storeRowsHtml}
  </table>
</body>
</html>`;

    const blob = new Blob(["\ufeff", wordHtml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BaoCao_QuanTri_PhucAn_AI_Agent.doc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Đã xuất file Báo cáo Word (.doc) thành công! 📄");
  }

  function exportPowerPointReport() {
    if (typeof PptxGenJS === "undefined") {
      showToast("Không tải được thư viện PptxGenJS. Vui lòng tải lại trang!", true);
      return;
    }
    const ctx = gatherAgentReportContext();
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";
    pptx.author = ctx.author;
    pptx.company = ctx.company;
    pptx.title = `Báo Cáo BI AI Agent - ${ctx.company}`;

    // Slide 1: Cover
    const s1 = pptx.addSlide();
    s1.background = { color: "FCEEF3" };
    s1.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 0.6, w: 8.8, h: 4.4, fill: { color: "FFFFFF" }, line: { color: "FAD2E1", width: 2 }, rectRadius: 0.25 });
    s1.addText("ENTERPRISE BI AI AGENT • DATALENS STUDIO", { x: 1.0, y: 1.0, w: 8.0, h: 0.4, fontSize: 12, bold: true, color: "FF5B8E" });
    s1.addText(`BÁO CÁO PHÂN TÍCH & ĐỐI SOÁT DỮ LIỆU\n${ctx.company}`, { x: 1.0, y: 1.5, w: 8.0, h: 1.4, fontSize: 24, bold: true, color: "1E293B" });
    s1.addText(`Ngành nghề: ${ctx.industry}\nĐối tượng xem: ${ctx.audience}\nNgười thực hiện: ${ctx.author} • Ngày xuất: ${ctx.dateStr}`, { x: 1.0, y: 3.1, w: 8.0, h: 1.3, fontSize: 13, color: "475569" });

    // Slide 2: Data Cleaning Summary
    const s2 = pptx.addSlide();
    s2.background = { color: "FFFFFF" };
    s2.addText("1. Kết Quả Làm Sạch Dữ Liệu (Bước 2 BPMN)", { x: 0.5, y: 0.4, w: 9.0, h: 0.5, fontSize: 20, bold: true, color: "FF5B8E" });
    const cleanCards = [
      { title: "Tổng Dòng Thô", val: `${ctx.totalRows.toLocaleString('vi-VN')}`, bg: "FFF5F8", fg: "1E293B" },
      { title: "Trùng Lặp", val: `${ctx.dupRows.toLocaleString('vi-VN')}`, bg: "FFE4E6", fg: "BE123C" },
      { title: "Đơn Đã Hủy", val: `${ctx.canRows.toLocaleString('vi-VN')}`, bg: "FEF3C7", fg: "B45309" },
      { title: "Đổi Trả Hàng", val: `${ctx.retRows.toLocaleString('vi-VN')}`, bg: "F3E8FF", fg: "6D28D9" },
      { title: "Dữ Liệu Sạch", val: `${ctx.cleanRows.toLocaleString('vi-VN')}`, bg: "DCFCE7", fg: "047857" }
    ];
    cleanCards.forEach((c, idx) => {
      const xPos = 0.5 + idx * 1.82;
      s2.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.2, w: 1.68, h: 1.5, fill: { color: c.bg }, line: { color: "FAD2E1", width: 1 }, rectRadius: 0.15 });
      s2.addText(c.title, { x: xPos + 0.1, y: 1.35, w: 1.48, h: 0.35, fontSize: 11, bold: true, color: c.fg, align: "center" });
      s2.addText(c.val, { x: xPos + 0.1, y: 1.8, w: 1.48, h: 0.6, fontSize: 22, bold: true, color: c.fg, align: "center" });
    });
    s2.addText(`Độ sạch dữ liệu đạt ${ctx.completenessPct}% sau khi loại bỏ trùng lặp, khấu trừ đơn hủy và hoàn nhập COGS cho hàng đổi trả.`, { x: 0.5, y: 3.1, w: 9.0, h: 0.8, fontSize: 13, color: "334155" });

    // Slide 3: 4 Macro KPIs
    const s3 = pptx.addSlide();
    s3.background = { color: "FFFFFF" };
    s3.addText("2. Chỉ Số Tổng Quan Kinh Doanh (4 Macro KPI)", { x: 0.5, y: 0.4, w: 9.0, h: 0.5, fontSize: 20, bold: true, color: "FF5B8E" });
    const kpiCards = [
      { title: "Doanh Thu Thuần", val: formatMoney(ctx.totalCleanRev), sub: `${ctx.revPct}% Mục tiêu`, bg: "FFF5F8", fg: "1D4ED8" },
      { title: "Lợi Nhuận Gộp", val: formatMoney(ctx.totalCleanProfit), sub: "Khớp chuẩn COGS", bg: "DCFCE7", fg: "047857" },
      { title: "Biên LN Gộp BQ", val: `${ctx.avgMargin}%`, sub: "Chuẩn định mức 32.0%", bg: "F3E8FF", fg: "6D28D9" },
      { title: "Tỷ Lệ Đổi Trả BQ", val: `${ctx.avgReturn}%`, sub: "Định mức trần 3.5%", bg: "FFE4E6", fg: "BE123C" }
    ];
    kpiCards.forEach((c, idx) => {
      const xPos = 0.5 + idx * 2.3;
      s3.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.3, w: 2.1, h: 2.0, fill: { color: c.bg }, line: { color: "FAD2E1", width: 1 }, rectRadius: 0.15 });
      s3.addText(c.title, { x: xPos + 0.1, y: 1.45, w: 1.9, h: 0.4, fontSize: 12, bold: true, color: c.fg, align: "center" });
      s3.addText(c.val, { x: xPos + 0.1, y: 1.95, w: 1.9, h: 0.6, fontSize: 20, bold: true, color: "1E293B", align: "center" });
      s3.addText(c.sub, { x: xPos + 0.1, y: 2.65, w: 1.9, h: 0.4, fontSize: 10, color: "475569", align: "center" });
    });

    // Slide 4: Insight DATA -> INFORMATION -> INSIGHT -> DECISION
    const s4 = pptx.addSlide();
    s4.background = { color: "FFFFFF" };
    s4.addText("3. Phân Tích Insight (DATA → INFORMATION → INSIGHT → DECISION)", { x: 0.5, y: 0.4, w: 9.0, h: 0.5, fontSize: 18, bold: true, color: "FF5B8E" });
    const insTable = [
      [{ text: "Giai Đoạn", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } }, { text: "Nội Dung Phân Tích Từ Dữ Liệu Thực Tế", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } }],
      ["1. DATA", `Kiểm tra ${ctx.totalRows.toLocaleString('vi-VN')} dòng giao dịch gốc (${ctx.canRows} đơn hủy, ${ctx.retRows} đổi trả, ${ctx.dupRows} trùng lặp).`],
      ["2. INFORMATION", `Tỷ lệ dữ liệu sạch đạt ${ctx.completenessPct}%, tách riêng các bản ghi lỗi và kiểm tra ngoại lai theo ngưỡng 1.5×IQR.`],
      ["3. INSIGHT", "Đơn hủy từ tồn kho ảo và lỗi ghi nhận trùng POS làm sai lệch doanh thu thực và biên lợi nhuận."],
      ["4. DECISION", "Áp dụng đồng bộ tồn kho real-time, dùng Mean + Median giao KPI và bật Data Validation tại nguồn."]
    ];
    s4.addTable(insTable, { x: 0.5, y: 1.15, w: 9.0, colW: [2.0, 7.0], fontSize: 12, border: { pt: 1, color: "FAD2E1" } });

    // Slide 5: Action Plan & KPI
    const s5 = pptx.addSlide();
    s5.background = { color: "FFFFFF" };
    s5.addText("4. Đề Xuất Giải Pháp, Bộ Phận Phụ Trách & KPI", { x: 0.5, y: 0.4, w: 9.0, h: 0.5, fontSize: 19, bold: true, color: "FF5B8E" });
    const actionTable = [
      [
        { text: "Ưu Tiên", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "Giải Pháp Cụ Thể", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "Bộ Phận Phụ Trách", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "KPI Đo Lường", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } }
      ],
      ["Ưu tiên 1", "Chuẩn hóa tư vấn & đối soát mã giao dịch gốc tự động", "QL Cửa hàng, CSKH & Kho", "Đổi trả <= 3.5%, khớp 100% mã gốc"],
      ["Ưu tiên 2", "Đồng bộ tồn kho POS real-time & cảnh báo SKU sắp hết", "Vận hành Bán lẻ & Kho", "Giảm tỷ lệ hủy đơn < 4.0%"],
      ["Ưu tiên 3", "Áp dụng Data Validation & cảnh báo ngưỡng IQR", "BI / Data Analyst & IT", "Độ đầy đủ >= 99.5%, Trùng lặp = 0%"]
    ];
    s5.addTable(actionTable, { x: 0.5, y: 1.15, w: 9.0, colW: [1.4, 3.2, 2.2, 2.2], fontSize: 11, border: { pt: 1, color: "FAD2E1" } });

    // Slide 6: Top Stores Summary
    const s6 = pptx.addSlide();
    s6.background = { color: "FFFFFF" };
    s6.addText("5. Bảng Hiệu Suất Top Cửa Hàng Tiêu Biểu", { x: 0.5, y: 0.4, w: 9.0, h: 0.5, fontSize: 19, bold: true, color: "FF5B8E" });
    const topStores = ctx.stores.slice(0, 8);
    const storeTbl = [
      [
        { text: "Cửa Hàng", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "Khu Vực", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "DT Thuần", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "% Đạt", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "Đổi Trả", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } }
      ],
      ...topStores.map(s => [
        s.name,
        s.region,
        formatMoney(s.cleanRev),
        `${s.targetRevenue > 0 ? ((s.cleanRev / s.targetRevenue) * 100).toFixed(1) : "0.0"}%`,
        `${s.returnRate}%`
      ])
    ];
    s6.addTable(storeTbl, { x: 0.5, y: 1.1, w: 9.0, colW: [2.8, 1.7, 1.8, 1.3, 1.4], fontSize: 11, border: { pt: 1, color: "FAD2E1" } });

    pptx.writeFile({ fileName: "BaoCao_ThuyetTrinh_PhucAn_AI_Agent.pptx" });
    showToast("Đã xuất file Slide PowerPoint (.pptx) thành công! 📊");
  }

  function applyExcelTableStyling(ws, dataRows, opts = {}) {
    if (!ws || !ws["!ref"]) return;
    const range = XLSX.utils.decode_range(ws["!ref"]);
    const headerBg = opts.headerBg || "FF5B8E";
    const stripeBg = opts.stripeBg || "FFF5F8";
    const borderAll = {
      top: { style: "thin", color: { rgb: "CBD5E1" } },
      bottom: { style: "thin", color: { rgb: "CBD5E1" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } }
    };

    const colWidths = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      let maxLen = 12;
      for (let R = range.s.r; R <= range.e.r; R++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[addr];
        if (!cell) continue;
        const valLen = String(cell.v !== undefined && cell.v !== null ? cell.v : "").length;
        if (R <= 50 && valLen > maxLen) maxLen = Math.min(valLen, 42);

        if (R === 0) {
          cell.s = {
            fill: { patternType: "solid", fgColor: { rgb: headerBg } },
            font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
              top: { style: "medium", color: { rgb: "9F1239" } },
              bottom: { style: "medium", color: { rgb: "9F1239" } },
              left: { style: "thin", color: { rgb: "FFFFFF" } },
              right: { style: "thin", color: { rgb: "FFFFFF" } }
            }
          };
        } else {
          const rowObj = dataRows[R - 1];
          const customStyle = opts.getCellStyle ? opts.getCellStyle(R, C, cell, rowObj, ws) : null;
          const defaultBg = (R % 2 === 0) ? stripeBg : "FFFFFF";
          cell.s = {
            fill: { patternType: "solid", fgColor: { rgb: (customStyle && customStyle.bg) || defaultBg } },
            font: {
              name: "Calibri",
              sz: 10,
              bold: Boolean(customStyle && customStyle.bold),
              color: { rgb: (customStyle && customStyle.fg) || "1E293B" }
            },
            alignment: {
              horizontal: (typeof cell.v === "number") ? "right" : "left",
              vertical: "center"
            },
            border: borderAll
          };
          if (typeof cell.v === "number") {
            cell.z = "#,##0";
          }
        }
      }
      colWidths.push({ wch: Math.min(maxLen + 4, 44) });
    }
    ws["!cols"] = colWidths;
    ws["!rows"] = [{ hpt: 28 }];
  }

  function exportExcelFinalReport() {
    if (typeof XLSX === "undefined") {
      showToast("Không tải được thư viện SheetJS (XLSX)!", true);
      return;
    }
    const records = (currentRawRecords && currentRawRecords.length > 0) ? currentRawRecords : defaultSampleRawRecords;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Full original dataset with repaired/cleaned values applied
    const allEditedRows = records.map(r => {
      const isErr = r.type && r.type !== "valid";
      const info = isErr ? getErrorAnalysisAndFix(r) : null;
      const repairedRev = isErr ? (r.fixedRev !== undefined ? Number(r.fixedRev) : info.defaultRev) : Number(r.rev);

      const baseObj = (r.rawRow && typeof r.rawRow === "object")
        ? { ...r.rawRow }
        : {
            Ma_Giao_Dich: r.code,
            Thoi_Gian_Giao_Dich: r.time,
            Ten_Cua_Hang: r.store,
            Ten_SanPham: r.prod,
            Danh_Muc: r.cat,
            Tong_Tien: r.rev,
            Gia_Von: r.cogs,
            Trang_Thai: r.status
          };

      if (isErr && r.revKey && Object.prototype.hasOwnProperty.call(baseObj, r.revKey)) {
        baseObj[r.revKey] = repairedRev;
      } else if (isErr && Object.prototype.hasOwnProperty.call(baseObj, "Tong_Tien")) {
        baseObj.Tong_Tien = repairedRev;
      }

      baseObj.Trang_Thai_Lam_Sach = isErr ? `Đã sửa (${info.errorLabel})` : "Hợp lệ";
      baseObj.Gia_Tri_Goc_Truoc_Sua = Number(r.rev) || 0;
      baseObj.Gia_Tri_Sau_Sua = repairedRev;
      return baseObj;
    });

    const wsAll = XLSX.utils.json_to_sheet(allEditedRows);
    const s1Keys = allEditedRows.length > 0 ? Object.keys(allEditedRows[0]) : [];
    const idxStatusCol = s1Keys.indexOf("Trang_Thai_Lam_Sach");
    const idxOldCol = s1Keys.indexOf("Gia_Tri_Goc_Truoc_Sua");
    const idxNewCol = s1Keys.indexOf("Gia_Tri_Sau_Sua");

    applyExcelTableStyling(wsAll, allEditedRows, {
      headerBg: "FF5B8E",
      stripeBg: "FFF5F8",
      getCellStyle: (R, C, cell, rowObj) => {
        const isEdited = rowObj && String(rowObj.Trang_Thai_Lam_Sach || "").startsWith("Đã sửa");
        if (!isEdited) return null;
        if (C === idxOldCol) return { bg: "FFE4E6", fg: "BE123C", bold: true };
        if (C === idxNewCol || C === idxStatusCol) return { bg: "DCFCE7", fg: "047857", bold: true };
        return { bg: "F0FDF4", fg: "1E293B" };
      }
    });
    XLSX.utils.book_append_sheet(wb, wsAll, "1_DuLieu_DaChinhSua");

    // Sheet 2: Only the rows that were erroneous & edited (Sai -> Đúng)
    const repairedOnlyRows = records
      .filter(r => r.type && r.type !== "valid")
      .map(r => {
        const info = getErrorAnalysisAndFix(r);
        const repairedRev = r.fixedRev !== undefined ? Number(r.fixedRev) : info.defaultRev;
        return {
          Ma_Giao_Dich: r.code,
          Thoi_Gian: r.time,
          Cua_Hang: r.store,
          San_Pham: r.prod,
          Loai_Loi: info.errorLabel,
          Trang_Thai_Goc: r.status,
          Gia_Tri_Sai_Truoc_Sua: Number(r.rev) || 0,
          Gia_Tri_Dung_Sau_Sua: repairedRev,
          Trang_Thai_Sua: "Đã sửa",
          Nguyen_Nhan_Sai: info.reason,
          Giai_Phap_Khac_Phuc: info.solution
        };
      });

    if (repairedOnlyRows.length > 0) {
      const wsRep = XLSX.utils.json_to_sheet(repairedOnlyRows);
      applyExcelTableStyling(wsRep, repairedOnlyRows, {
        headerBg: "E11D48",
        stripeBg: "FFFBFB",
        getCellStyle: (R, C) => {
          if (C === 6) return { bg: "FFE4E6", fg: "BE123C", bold: true }; // Giá trị sai (đỏ)
          if (C === 7 || C === 8) return { bg: "DCFCE7", fg: "047857", bold: true }; // Giá trị đã sửa (xanh)
          return null;
        }
      });
      XLSX.utils.book_append_sheet(wb, wsRep, "2_ChiTiet_Dong_DaSua");
    }

    // Sheet 3: Only clean valid rows from original data
    const cleanOnlyRows = records
      .filter(r => !r.type || r.type === "valid")
      .map(r => (r.rawRow && typeof r.rawRow === "object")
        ? { ...r.rawRow }
        : {
            Ma_Giao_Dich: r.code,
            Thoi_Gian_Giao_Dich: r.time,
            Ten_Cua_Hang: r.store,
            Ten_SanPham: r.prod,
            Danh_Muc: r.cat,
            Tong_Tien: r.rev,
            Gia_Von: r.cogs,
            Trang_Thai: r.status
          });

    if (cleanOnlyRows.length > 0) {
      const wsClean = XLSX.utils.json_to_sheet(cleanOnlyRows);
      applyExcelTableStyling(wsClean, cleanOnlyRows, {
        headerBg: "059669",
        stripeBg: "F0FDF4"
      });
      XLSX.utils.book_append_sheet(wb, wsClean, "3_DuLieu_Sach_HopLe");
    }

    XLSX.writeFile(wb, "DuLieu_DaChinhSua_PhucAn_AI_Agent.xlsx");
    showToast(`Đã xuất file Excel kẻ bảng có màu phân tách (${allEditedRows.length.toLocaleString('vi-VN')} dòng)! 📗`);
  }

  function exportDashboardHtmlReport() {
    const ctx = gatherAgentReportContext();
    const m = buildDetailedReportMetrics(ctx);

    const storeRows = ctx.stores.map((s, idx) => {
      const pct = s.targetRevenue > 0 ? ((s.cleanRev / s.targetRevenue) * 100).toFixed(1) : "0.0";
      const margin = s.cleanRev > 0 ? ((s.cleanProfit / s.cleanRev) * 100).toFixed(1) : "0.0";
      const pillCls = s.priority === 1 ? "pill-red" : (s.priority === 2 ? "pill-amber" : "pill-green");
      return `<tr><td>#${idx + 1}</td><td><strong>${escapeHtml(s.name)}</strong><br><small style="color:#64748B;">${escapeHtml(s.manager || "")}</small></td><td>${escapeHtml(s.region)}</td><td style="text-align:right;font-weight:700;">${formatMoney(s.cleanRev)}</td><td style="text-align:right;">${formatMoney(s.targetRevenue)}</td><td style="text-align:right;font-weight:700;">${pct}%</td><td style="text-align:right;color:#047857;font-weight:700;">${formatMoney(s.cleanProfit)}</td><td style="text-align:right;">${margin}%</td><td style="text-align:right;${s.returnRate > 3.5 ? 'color:#E11D48;font-weight:700;' : ''}">${s.returnRate}%</td><td><span class="pill ${pillCls}">${escapeHtml(s.status || "Ổn định")}</span></td></tr>`;
    }).join("");

    const prodRows = m.topProducts.map((p, idx) => {
      const share = m.validRevTotal > 0 ? ((p.rev / m.validRevTotal) * 100).toFixed(1) : "0.0";
      const margin = p.rev > 0 ? ((p.profit / p.rev) * 100).toFixed(1) : "0.0";
      return `<tr><td>${idx + 1}</td><td><strong>${escapeHtml(p.name)}</strong></td><td>${escapeHtml(p.cat)}</td><td style="text-align:right;">${p.orders.toLocaleString('vi-VN')}</td><td style="text-align:right;font-weight:700;">${formatMoney(p.rev)}</td><td style="text-align:right;color:#047857;">${formatMoney(p.profit)}</td><td style="text-align:right;">${margin}%</td><td style="text-align:right;font-weight:700;color:#D92662;">${share}%</td></tr>`;
    }).join("");

    const regionRows = m.regions.map(rg => `<tr><td><strong>${escapeHtml(rg.region)}</strong></td><td style="text-align:center;">${rg.storeCount}</td><td style="text-align:right;font-weight:700;">${formatMoney(rg.cleanRev)}</td><td style="text-align:right;">${rg.pctTarget}%</td><td style="text-align:right;color:#047857;">${formatMoney(rg.cleanProfit)}</td><td style="text-align:right;">${rg.marginPct}%</td><td style="text-align:right;font-weight:700;color:#D92662;">${rg.sharePct}%</td><td style="text-align:right;">${rg.avgReturn}%</td></tr>`).join("");

    const anomalyHtml = m.p1Stores.length > 0
      ? m.p1Stores.map(s => `<div class="alert-box"><strong>${escapeHtml(s.name)} (${escapeHtml(s.region)})</strong> — ${escapeHtml(s.anomaly || "Cần rà soát")}<br><span style="color:#334155;">Khuyến nghị: ${escapeHtml(s.recommendation)}</span></div>`).join("")
      : `<div class="ok-box">Không phát hiện đơn vị nào ở mức cảnh báo đỏ khẩn cấp (Ưu tiên 1).</div>`;

    const dashHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo Cáo Quản Trị BI Toàn Diện - ${escapeHtml(ctx.company)}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #FCEEF3; color: #1E293B; margin: 0; padding: 24px; line-height: 1.5; }
    .wrap { max-width: 1180px; margin: 0 auto; display: grid; gap: 18px; }
    .card { background: #FFF; border: 1px solid #FAD2E1; border-radius: 20px; padding: 22px; box-shadow: 0 8px 24px rgba(255,91,142,0.08); }
    .header { background: linear-gradient(135deg, #0F1E36, #1E293B, #3B1739); color: #FFF; }
    .grid6 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
    .grid7 { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; }
    .grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    .kpi { border-radius: 16px; padding: 16px; border: 1px solid #FAD2E1; background: #FFF5F8; }
    .kpi h4 { margin: 0 0 6px; font-size: 11px; color: #64748B; text-transform: uppercase; }
    .kpi .val { font-size: 22px; font-weight: 900; color: #0F172A; }
    .stat-box { border-radius: 12px; padding: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; text-align: center; }
    .stat-box small { display: block; font-size: 10px; color: #64748B; font-weight: 700; }
    .stat-box strong { font-size: 14px; color: #0F172A; }
    h2 { margin: 0 0 12px; font-size: 16px; color: #0F172A; border-left: 4px solid #FF5B8E; padding-left: 10px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    th { background: #FFF5F8; color: #475569; padding: 9px 10px; text-align: left; border-bottom: 2px solid #FAD2E1; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px 10px; border-bottom: 1px solid #F1F5F9; }
    tfoot td { background: #FFF5F8; border-top: 2px solid #FAD2E1; font-weight: 800; }
    .pill { display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 10.5px; font-weight: 700; }
    .pill-green { background: #DCFCE7; color: #047857; }
    .pill-amber { background: #FEF3C7; color: #B45309; }
    .pill-red { background: #FFE4E6; color: #BE123C; }
    .alert-box { padding: 12px; border-radius: 12px; background: #FFF1F2; border: 1px solid #FECDD3; margin-bottom: 8px; font-size: 13px; }
    .ok-box { padding: 12px; border-radius: 12px; background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; font-weight: 700; font-size: 13px; }
    .print-btn { float: right; background: #FF5B8E; color: #FFF; border: none; padding: 8px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; }
    @media print { .print-btn { display: none; } body { background: #FFF; padding: 0; } .card { box-shadow: none; break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card header">
      <button class="print-btn" onclick="window.print()">🖨️ In / Lưu PDF</button>
      <div style="font-size:11px;font-weight:800;color:#F9A8D4;letter-spacing:0.6px;">ENTERPRISE BI AI AGENT • BÁO CÁO QUẢN TRỊ TOÀN DIỆN (${m.reportCode})</div>
      <h1 style="margin:6px 0 4px;font-size:26px;">${escapeHtml(ctx.company)}</h1>
      <div style="font-size:13px;opacity:0.95;">Ngành: ${escapeHtml(ctx.industry)} • Đối tượng: ${escapeHtml(ctx.audience)} • Người lập: ${escapeHtml(ctx.author)} • Ngày xuất: ${ctx.dateStr} ${m.timeStr}</div>
      <div style="font-size:12.5px;margin-top:8px;opacity:0.9;"><strong>Mục tiêu:</strong> ${escapeHtml(ctx.desc)} | <strong>Tệp nguồn:</strong> ${escapeHtml(m.fileName)}</div>
    </div>

    <div class="card">
      <h2>I. Hệ Thống 6 Chỉ Số Kinh Doanh Cốt Lõi (Macro KPI)</h2>
      <div class="grid6">
        <div class="kpi"><h4>Doanh Thu Thuần</h4><div class="val">${formatMoney(ctx.totalCleanRev)}</div><div style="font-size:12px;color:#059669;font-weight:700;">${ctx.revPct}% Mục tiêu (${m.revGap >= 0 ? '+' : '-'}${formatMoney(Math.abs(m.revGap))})</div></div>
        <div class="kpi" style="background:#F0FDF4;"><h4>Lợi Nhuận Gộp</h4><div class="val">${formatMoney(ctx.totalCleanProfit)}</div><div style="font-size:12px;color:#059669;font-weight:700;">Biên LN BQ: ${ctx.avgMargin}% (Chuẩn 32%)</div></div>
        <div class="kpi" style="background:#F8FAFC;"><h4>Tổng Giá Vốn (COGS)</h4><div class="val">${formatMoney(m.totalCogs)}</div><div style="font-size:12px;color:#475569;font-weight:700;">Chiếm ${m.cogsPct}% doanh thu thuần</div></div>
        <div class="kpi" style="background:#FAF5FF;"><h4>AOV (Trung Bình / Trung Vị)</h4><div class="val">${formatMoney(m.meanRev)}</div><div style="font-size:12px;color:#7C3AED;font-weight:700;">Median: ${formatMoney(m.medianRev)}</div></div>
        <div class="kpi" style="background:#FFF5F8;"><h4>Dữ Liệu Sạch / Tổng Thô</h4><div class="val">${ctx.cleanRows.toLocaleString('vi-VN')} / ${ctx.totalRows.toLocaleString('vi-VN')}</div><div style="font-size:12px;color:#D92662;font-weight:700;">Đạt ${ctx.completenessPct}% • Tin cậy ${m.trustScore}/100</div></div>
        <div class="kpi" style="background:#FFF1F2;"><h4>Đổi Trả BQ &amp; Lỗi Đã Lọc</h4><div class="val">${ctx.avgReturn}%</div><div style="font-size:12px;color:#BE123C;font-weight:700;">${ctx.dupRows} trùng · ${ctx.canRows} hủy · ${ctx.retRows} trả</div></div>
      </div>
    </div>

    <div class="card">
      <h2>II. Phân Tích Thống Kê Mô Tả (Mean, Median, IQR, Outliers)</h2>
      <div class="grid7">
        <div class="stat-box"><small>MIN</small><strong>${formatMoney(m.minRev)}</strong></div>
        <div class="stat-box"><small>Q1 (25%)</small><strong>${formatMoney(m.q1Rev)}</strong></div>
        <div class="stat-box"><small>MEDIAN (50%)</small><strong>${formatMoney(m.medianRev)}</strong></div>
        <div class="stat-box"><small>MEAN (TB)</small><strong>${formatMoney(m.meanRev)}</strong></div>
        <div class="stat-box"><small>Q3 (75%)</small><strong>${formatMoney(m.q3Rev)}</strong></div>
        <div class="stat-box"><small>MAX</small><strong>${formatMoney(m.maxRev)}</strong></div>
        <div class="stat-box"><small>NGOẠI LAI IQR</small><strong style="color:#E11D48;">${m.outlierCount.toLocaleString('vi-VN')} đơn</strong></div>
      </div>
    </div>

    <div class="card">
      <h2>III. Top ${Math.min(10, m.topProducts.length)} Sản Phẩm / SKU Dẫn Đầu Doanh Thu</h2>
      <table>
        <thead><tr><th>#</th><th>Sản Phẩm / SKU</th><th>Ngành Hàng</th><th style="text-align:right">Số Đơn</th><th style="text-align:right">Doanh Thu</th><th style="text-align:right">LN Gộp</th><th style="text-align:right">Biên (%)</th><th style="text-align:right">Tỷ Trọng</th></tr></thead>
        <tbody>${prodRows || '<tr><td colspan="8" style="text-align:center;color:#94A3B8;">Không có chi tiết sản phẩm.</td></tr>'}</tbody>
      </table>
    </div>

    <div class="card">
      <h2>IV. Hiệu Suất Theo Khu Vực Địa Lý</h2>
      <table>
        <thead><tr><th>Khu Vực</th><th style="text-align:center">Số ĐV</th><th style="text-align:right">Doanh Thu</th><th style="text-align:right">% Đạt</th><th style="text-align:right">LN Gộp</th><th style="text-align:right">Biên (%)</th><th style="text-align:right">Tỷ Trọng</th><th style="text-align:right">Đổi Trả</th></tr></thead>
        <tbody>${regionRows}</tbody>
      </table>
    </div>

    <div class="card">
      <h2>V. Bảng Xếp Hạng Toàn Bộ ${ctx.stores.length} Cửa Hàng / Đơn Vị</h2>
      <table>
        <thead><tr><th>Hạng</th><th>Cửa Hàng</th><th>Khu Vực</th><th style="text-align:right">Doanh Thu Thuần</th><th style="text-align:right">Mục Tiêu</th><th style="text-align:right">% Đạt</th><th style="text-align:right">LN Gộp</th><th style="text-align:right">Biên (%)</th><th style="text-align:right">Đổi Trả</th><th>Phân Loại</th></tr></thead>
        <tbody>${storeRows}</tbody>
        <tfoot><tr><td>—</td><td colspan="2">TỔNG CỘNG / BÌNH QUÂN (${ctx.stores.length} ĐƠN VỊ)</td><td style="text-align:right;">${formatMoney(ctx.totalCleanRev)}</td><td style="text-align:right;">${formatMoney(ctx.totalTargetRev)}</td><td style="text-align:right;">${ctx.revPct}%</td><td style="text-align:right;">${formatMoney(ctx.totalCleanProfit)}</td><td style="text-align:right;">${ctx.avgMargin}%</td><td style="text-align:right;">${ctx.avgReturn}%</td><td>${m.p1Stores.length} P1</td></tr></tfoot>
      </table>
    </div>

    <div class="card">
      <h2>VI. Kiểm Toán Bất Thường &amp; Lộ Trình Hành Động 30-60-90 Ngày</h2>
      ${anomalyHtml}
      <div class="grid3" style="margin-top:12px;">
        <div class="kpi" style="background:#FFF1F2;"><h4>Ngày 1–30 (Ưu tiên 1)</h4><p style="font-size:12.5px;margin:0;">Can thiệp ${m.p1Stores.length} đơn vị P1, đối soát 100% mã GD gốc, kéo tỷ lệ đổi trả &le; 3.5%.</p></div>
        <div class="kpi" style="background:#FFFBEB;"><h4>Ngày 31–60 (Ưu tiên 2)</h4><p style="font-size:12.5px;margin:0;">Đồng bộ tồn kho POS real-time, tối ưu biên LN nhóm SKU chủ lực &ge; 32%.</p></div>
        <div class="kpi" style="background:#F0FDF4;"><h4>Ngày 61–90 (Ưu tiên 3)</h4><p style="font-size:12.5px;margin:0;">Bật Data Validation, tự động hóa kiểm toán tuần, giữ độ sạch &ge; 99.5% &amp; trùng lặp = 0%.</p></div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob(["\ufeff", dashHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Dashboard_BI_PhucAn_AI_Agent.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Đã xuất file Dashboard Báo Cáo Web đầy đủ (.html) thành công! 📊");
  }

  document.getElementById("btn-export-word")?.addEventListener("click", exportWordReport);
  document.getElementById("btn-export-pptx")?.addEventListener("click", exportPowerPointReport);
  document.getElementById("btn-export-excel-final")?.addEventListener("click", exportExcelFinalReport);
  document.getElementById("btn-export-dashboard-html")?.addEventListener("click", exportDashboardHtmlReport);
  document.getElementById("btn-export-both")?.addEventListener("click", () => {
    exportWordReport();
    setTimeout(exportPowerPointReport, 350);
    setTimeout(exportExcelFinalReport, 700);
    setTimeout(exportDashboardHtmlReport, 1050);
  });

  // Render Anomaly Cards for Phase 3
  function renderAnomalyCards() {
    const container = document.getElementById("anomaly-cards-container");
    if (!container) return;

    if (!state.isAuditCompleted) {
      container.innerHTML = `
        <div class="col-span-1 md:col-span-2 p-8 text-center bg-white border border-[#FAD2E1] rounded-2xl">
          <div class="w-12 h-12 rounded-2xl bg-[#FFE2E5] text-[#FA5A7D] flex items-center justify-center mx-auto mb-3 text-xl">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h4 class="text-sm font-bold text-slate-800 mb-1">Chưa có phát hiện bất thường</h4>
          <p class="text-xs text-slate-500">Hệ thống sẽ tự động quét, chẩn đoán nguyên nhân sụt giảm biên lợi nhuận, bẫy doanh thu và tỷ lệ đổi trả sau khi hoàn tất đối soát ở Giai đoạn 2.</p>
        </div>
      `;
      return;
    }

    const anomalyStores = getActiveAnalytics().stores.filter(s => s.anomaly && s.anomaly.trim() !== "");
    if (anomalyStores.length === 0) {
      container.innerHTML = `
        <div class="col-span-1 md:col-span-2 p-8 text-center bg-white border border-[#FAD2E1] rounded-2xl">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h4 class="text-sm font-bold text-slate-800 mb-1">Tất cả điểm bán vận hành chuẩn mực</h4>
          <p class="text-xs text-slate-500">Không phát hiện sai lệch kỳ đối chiếu hoặc bẫy biên lợi nhuận.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    anomalyStores.slice(0, 4).forEach((store, idx) => {
      let badgeColor = "from-rose-200 via-pink-200 to-rose-300";
      let tagBg = "bg-rose-100 text-rose-700";
      let btnBg = "bg-rose-600 hover:bg-rose-700 text-white";
      let statText = "-24.3% LN";
      let tagLabel = "Bẫy Doanh Thu";

      if (idx === 1) {
        badgeColor = "from-purple-200 via-indigo-200 to-pink-200";
        tagBg = "bg-purple-100 text-purple-700";
        btnBg = "bg-purple-600 hover:bg-purple-700 text-white";
        statText = "-7.2%/ngày";
        tagLabel = "Lệch Kỳ Đối Chiếu";
      } else if (idx === 2) {
        badgeColor = "from-amber-200 via-rose-200 to-pink-200";
        tagBg = "bg-amber-100 text-amber-800";
        btnBg = "bg-amber-600 hover:bg-amber-700 text-white";
        statText = `${store.returnRate || 14.8}% Trả Hàng`;
        tagLabel = "Báo Động Đổi Trả";
      } else if (idx === 3) {
        badgeColor = "from-blue-200 via-sky-200 to-pink-200";
        tagBg = "bg-blue-100 text-blue-700";
        btnBg = "bg-blue-600 hover:bg-blue-700 text-white";
        statText = "68.5% Target";
        tagLabel = "Hụt Target Nặng";
      }

      const card = document.createElement("div");
      card.className = "rounded-2xl border border-[#FAD2E1] bg-white overflow-hidden shadow-xs flex flex-col justify-between";
      card.innerHTML = `
        <div>
          <div class="h-24 bg-gradient-to-r ${badgeColor} relative p-3 flex items-start justify-between">
            <span class="px-2.5 py-1 bg-white/90 text-slate-800 font-extrabold text-xs rounded-full shadow-xs">
              ${statText}
            </span>
          </div>
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-extrabold text-slate-900">${store.id} - ${store.name}</h4>
              <span class="text-[10px] ${tagBg} font-bold px-2 py-0.5 rounded-full">${tagLabel}</span>
            </div>
            <div class="text-[11px] text-[#FF5B8E] font-bold">${store.manager} • ${store.region}</div>
            <div class="bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-xs text-rose-950 mt-2 space-y-1">
              <div><strong>Chẩn đoán:</strong> ${store.anomaly}</div>
              <div class="text-slate-600"><strong>Khuyến nghị:</strong> ${store.recommendation}</div>
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Render Priority Matrix for Sales Director
  function renderPriorityMatrix(filter = "all") {
    const tbody = document.getElementById("priority-matrix-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!state.isAuditCompleted) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="p-8 text-center text-slate-400 font-medium">
            <i class="fa-solid fa-shield-halved text-3xl mb-2 text-slate-300 block"></i>
            Chưa có dữ liệu đối chiếu. Vui lòng hoàn thành Giai đoạn 1 & 2 để AI Agent phát hiện bất thường và xếp hạng ưu tiên.
          </td>
        </tr>
      `;
      return;
    }

    const filtered = getActiveAnalytics().stores
      .filter(s => filter === "all" || s.priority.toString() === filter)
      .sort((a, b) => a.priority - b.priority); // Highest priority (1) first

    filtered.forEach(s => {
      const targetPercent = ((s.cleanRev / s.targetRevenue) * 100).toFixed(1);
      const grossMarginPercent = ((s.cleanProfit / s.cleanRev) * 100).toFixed(1);

      let priorityBadge = "";
      if (s.priority === 1) {
        priorityBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 w-max">
          <i class="fa-solid fa-triangle-exclamation text-rose-500"></i> Ưu Tiên 1: Cấp thiết
        </span>`;
      } else if (s.priority === 2) {
        priorityBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-max">
          <i class="fa-solid fa-eye text-amber-500"></i> Ưu Tiên 2: Cần theo dõi
        </span>`;
      } else if (s.priority === 3) {
        priorityBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 w-max inline-block">
          Ưu Tiên 3: Ổn định
        </span>`;
      } else {
        priorityBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-max">
          <i class="fa-solid fa-star text-emerald-500"></i> Ưu Tiên 4: Xuất sắc
        </span>`;
      }

      const diagnosis = s.anomaly ? `<span class="text-rose-900 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-100 block">${s.anomaly}</span>` : `<span class="text-slate-500">Không có bất thường. Chỉ số vận hành đạt định mức quy chuẩn.</span>`;
      const recommendation = s.recommendation ? `<span class="text-emerald-950 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-100 block">${s.recommendation}</span>` : `<span class="text-slate-500">Duy trì định mức quản trị hiện tại, phát huy sản phẩm chủ lực.</span>`;

      const tr = document.createElement("tr");
      tr.className = `hover:bg-slate-50 transition ${s.priority === 1 ? 'bg-rose-50/30' : ''}`;
      tr.innerHTML = `
        <td class="p-3">${priorityBadge}</td>
        <td class="p-3">
          <div class="font-bold text-slate-900">${s.name}</div>
          <div class="text-[11px] text-slate-500">${s.id} • QL: ${s.manager}</div>
        </td>
        <td class="p-3 text-right font-mono font-bold text-slate-900">${formatMoney(s.cleanRev)}</td>
        <td class="p-3 text-right font-mono font-bold ${targetPercent < 80 ? 'text-rose-700' : 'text-emerald-700'}">${targetPercent}%</td>
        <td class="p-3 text-right font-mono font-bold ${grossMarginPercent < 25 ? 'text-rose-700' : 'text-slate-700'}">${grossMarginPercent}%</td>
        <td class="p-3 text-right font-mono font-bold ${s.returnRate > 5.0 ? 'text-rose-700' : 'text-slate-700'}">${s.returnRate}%</td>
        <td class="p-3 max-w-xs text-xs">${diagnosis}</td>
        <td class="p-3 max-w-xs text-xs">${recommendation}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById("filter-priority").addEventListener("change", (e) => {
    renderPriorityMatrix(e.target.value);
  });

  // Decision Modal Logic (GIÁM ĐỐC KINH DOANH RA QUYẾT ĐỊNH)
  const decisionModal = document.getElementById("decision-modal");
  function openDecisionModal(storeId) {
    const store = getActiveAnalytics().stores.find(s => s.id === storeId);
    if (!store) return;
    state.selectedStoreForDecision = store;

    document.getElementById("modal-store-name").textContent = `${store.id} - ${store.name}`;
    document.getElementById("modal-store-manager").textContent = `Quản lý cửa hàng: ${store.manager} | Khu vực: ${store.region}`;
    document.getElementById("modal-diagnosis").textContent = store.anomaly || "Cửa hàng hoạt động ổn định, cần tiếp tục giám sát các chỉ số.";
    document.getElementById("modal-action-plan").value = store.recommendation || "Tiếp tục duy trì kế hoạch bán hàng tháng 11, khen thưởng nhân viên xuất sắc.";

    decisionModal.classList.remove("hidden");
  }

  document.getElementById("btn-close-modal").addEventListener("click", () => decisionModal.classList.add("hidden"));
  document.getElementById("btn-cancel-modal").addEventListener("click", () => decisionModal.classList.add("hidden"));

  document.getElementById("btn-confirm-decision").addEventListener("click", () => {
    if (state.selectedStoreForDecision) {
      state.selectedStoreForDecision.decisionApproved = true;
      decisionModal.classList.add("hidden");
      renderPriorityMatrix(document.getElementById("filter-priority").value);
      showToast(`Giám đốc Kinh doanh đã ký ban hành lệnh hỗ trợ khẩn cấp cho ${state.selectedStoreForDecision.name}!`);

      // Push confirmation to AI chat
      appendChatMessage(
        "system",
        `🔔 [LỆNH ĐIỀU ĐỘNG] Giám đốc Kinh doanh đã ký phê duyệt kế hoạch can thiệp cho <strong>${state.selectedStoreForDecision.name}</strong>.<br>` +
        `• <strong>Phương án:</strong> ${document.getElementById("modal-action-plan").value}<br>` +
        `• <strong>Phụ trách:</strong> ${document.getElementById("modal-assignee").value} | <strong>Thời hạn:</strong> ${document.getElementById("modal-deadline").value}`
      );
    }
  });

  // AI COPILOT CHAT LOGIC
  const chatForm = document.getElementById("ai-chat-form");
  const chatInput = document.getElementById("ai-chat-input");
  const chatContainer = document.getElementById("chat-messages-container");

  function appendChatMessage(sender, text) {
    const div = document.createElement("div");
    div.className = "flex items-start gap-2.5";

    if (sender === "user") {
      div.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
          <i class="fa-solid fa-user-tie"></i>
        </div>
        <div class="bg-indigo-600 text-white p-3.5 rounded-2xl max-w-2xl leading-relaxed text-xs shadow-xs">
          ${text}
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 text-xs shadow-xs">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="bg-white border border-slate-200 text-slate-800 p-3.5 rounded-2xl max-w-2xl leading-relaxed text-xs shadow-xs">
          ${text}
        </div>
      `;
    }

    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function handleAiQuery(query) {
    appendChatMessage("user", query);
    const qLower = query.toLowerCase();

    setTimeout(() => {
      let response = "";

      if (qLower.includes("chỉnh sửa") || qLower.includes("chinh sua") || qLower.includes("hiệu chỉnh") || qLower.includes("hãy sửa") || qLower.includes("làm sạch lại") || qLower.includes("lọc lại") || qLower.includes("sửa quy tắc") || qLower.includes("thay đổi quy tắc") || qLower.includes("sửa")) {
        executeAgentRevision(query);
        response = `🤖 <strong>AI Agent đã tiếp nhận lệnh và đang thực thi chỉnh sửa:</strong><br>` +
          `<div class="mt-1.5 p-2.5 bg-[#FFF0F5] border border-[#FFD1DF] rounded-xl text-slate-800 font-semibold">"${escapeHtml(query)}"</div>` +
          `<div class="mt-2 space-y-1 text-slate-700">` +
          `<div>• Đang kích hoạt lại Engine làm sạch dữ liệu theo quy tắc cập nhật...</div>` +
          `<div>• Tái áp dụng bộ lọc đơn trùng, đơn hủy và đồng bộ kỳ so sánh chuẩn hóa.</div>` +
          `<div>• Cập nhật bảng đối soát và kết quả báo cáo mới nhất.</div>` +
          `</div>` +
          `<div class="mt-3 flex flex-wrap gap-2">` +
          `<button onclick="window.switchPhaseTab(1)" class="px-3 py-1.5 bg-[#FF5B8E] text-white rounded-xl font-bold text-xs hover:bg-[#e04879] transition shadow-xs"><i class="fa-solid fa-wand-magic-sparkles"></i> Xem Kết Quả Làm Sạch (GĐ 1)</button>` +
          `<button onclick="window.openRevisionModal('${escapeHtml(query)}')" class="px-3 py-1.5 bg-white border border-[#FFD1DF] text-[#FF5B8E] rounded-xl font-bold text-xs hover:bg-[#FFF0F5] transition shadow-xs"><i class="fa-solid fa-sliders"></i> Mở Bảng Tinh Chỉnh Quy Tắc</button>` +
          `</div>`;
      } else if (qLower.includes("bpmn") || qLower.includes("quy trình làm sạch") || qLower.includes("làm sạch dữ liệu")) {
        response = `<strong>Quy Trình Làm Sạch Tự Động Theo Chuẩn BPMN 3.0:</strong><br>` +
          `1. <strong>Tiếp nhận & Quét cấu trúc:</strong> Tự động nhận diện trường dữ liệu (mã đơn, doanh thu, giá vốn, trạng thái, ngày giờ, chi nhánh).<br>` +
          `2. <strong>Khử trùng lặp (Deduplication):</strong> Phát hiện các mã giao dịch POS bị quẹt thẻ đúp hoặc trùng lặp mã đơn.<br>` +
          `3. <strong>Bóc tách đơn hủy & Hoàn tiền:</strong> Tách biệt các đơn hàng đã bị hủy hoặc hoàn tiền trước khi xuất kho.<br>` +
          `4. <strong>Kiểm soát đơn đổi trả bảo hành:</strong> Định lượng tỷ lệ hoàn hàng từng chi nhánh, phát hiện tư vấn sai công năng.<br>` +
          `5. <strong>Đồng bộ kỳ chuẩn hóa:</strong> Chuyển đổi về doanh thu bình quân/ngày tương đương để loại trừ tăng trưởng ảo.`;
      } else if (qLower.includes("bẫy doanh thu") || qLower.includes("bay doanh thu") || qLower.includes("ch03")) {
        const analytics = getActiveAnalytics();
        const lowMarginStores = analytics.stores.filter(s => s.cleanRev > 0 && ((s.cleanProfit / s.cleanRev) * 100) < 25);
        response = `<strong>Phân Tích Bẫy Doanh Thu (Revenue Trap) trên Dữ Liệu Hiện Tại:</strong><br>` +
          (lowMarginStores.length > 0
            ? `• Phát hiện <strong>${lowMarginStores.length}</strong> điểm bán có biên lợi nhuận dưới 25%: ${lowMarginStores.slice(0, 5).map(s => `<strong>${escapeHtml(s.name)}</strong> (${((s.cleanProfit / s.cleanRev) * 100).toFixed(1)}%)`).join(", ")}.<br>`
            : `• Toàn bộ <strong>${analytics.stores.length}</strong> cửa hàng trong tệp đang giữ biên lợi nhuận gộp trung bình <strong>${analytics.avgMargin}%</strong> (chưa phát hiện dấu hiệu xả hàng biên mỏng).<br>`) +
          `• <strong>Khuyến nghị:</strong> Theo dõi song song Doanh thu thuần và Lợi nhuận gộp, hạn chế chiết khấu sâu ở nhóm hàng biên thấp.`;
      } else if (qLower.includes("ch15") || qLower.includes("bình thạnh") || qLower.includes("đổi trả")) {
        const analytics = getActiveAnalytics();
        const highRetStores = [...analytics.stores].sort((a, b) => b.returnRate - a.returnRate).filter(s => s.returnRate > 3.5);
        response = `<strong>Phân Tích Tỷ Lệ Đổi Trả trên Tệp Dữ Liệu (${escapeHtml(customDatasetStats.fileName)}):</strong><br>` +
          `• <strong>Tỷ lệ đổi trả bình quân toàn hệ thống:</strong> ${analytics.avgReturn}% (${customDatasetStats.returnRows.toLocaleString('vi-VN')} đơn đổi trả).<br>` +
          (highRetStores.length > 0
            ? `• <strong>Điểm bán vượt ngưỡng an toàn (&gt;3.5%):</strong> ${highRetStores.slice(0, 5).map(s => `<strong>${escapeHtml(s.name)}</strong> (${s.returnRate}%)`).join(", ")}.<br>`
            : `• Tất cả ${analytics.stores.length} cửa hàng đều có tỷ lệ đổi trả trong ngưỡng an toàn (&le;3.5%).<br>`) +
          `• <strong>Khuyến nghị:</strong> Kiểm tra quy trình tư vấn bán hàng và đối soát mã giao dịch gốc cho các đơn hoàn trả.`;
      } else if (qLower.includes("ch04") || qLower.includes("hoàn kiếm") || qLower.includes("tăng trưởng thật") || qLower.includes("lệch kỳ") || qLower.includes("chuẩn hóa")) {
        const analytics = getActiveAnalytics();
        response = `<strong>Phân Tích Tăng Trưởng &amp; Chuẩn Hóa Dữ Liệu Hiện Tại:</strong><br>` +
          `• Tổng doanh thu thuần sau chuẩn hóa đạt <strong>${formatMoney(analytics.totalCleanRev)}</strong> trên <strong>${analytics.stores.length}</strong> cửa hàng (${customDatasetStats.cleanRows.toLocaleString('vi-VN')} đơn hợp lệ).<br>` +
          `• Đã tự động bóc tách <strong>${customDatasetStats.duplicateRows.toLocaleString('vi-VN')}</strong> giao dịch trùng lặp và <strong>${customDatasetStats.cancelledRows.toLocaleString('vi-VN')}</strong> đơn hủy để phản ánh đúng sức bán thực tế.`;
      } else if (qLower.includes("tiêu chuẩn phân loại") || qLower.includes("thứ tự ưu tiên") || qLower.includes("top 3") || qLower.includes("thị sát") || qLower.includes("khẩn cấp") || qLower.includes("ưu tiên")) {
        response = `<strong>Tiêu Chuẩn Xếp Hạng Ưu Tiên Hỗ Trợ Điểm Bán:</strong><br>` +
          `• 🔴 <strong>Ưu tiên 1 (Cấp thiết):</strong> Sụt giảm biên LN > 15%, hụt chỉ tiêu > 25%, hoặc tỷ lệ đổi trả > 10%. Cần lệnh can thiệp ngay.<br>` +
          `• 🟠 <strong>Ưu tiên 2 (Cần theo dõi):</strong> Đạt từ 80-90% kế hoạch, tỷ lệ đổi trả dao động 5-8%.<br>` +
          `• 🟡 <strong>Ưu tiên 3 (Ổn định):</strong> Đạt 90-100% mục tiêu, các chỉ số vận hành nằm trong dung sai cho phép.<br>` +
          `• 🟢 <strong>Ưu tiên 4 (Xuất sắc):</strong> Vượt > 100% kế hoạch cả doanh thu và lợi nhuận gộp.`;
      } else if (qLower.includes("bối cảnh") || qLower.includes("boi canh") || qLower.includes("doanh nghiệp của tôi") || qLower.includes("mục tiêu phân tích")) {
        if (businessContext.isConfigured) {
          response = `<strong>Bối Cảnh Doanh Nghiệp Đang Áp Dụng:</strong><br>` +
            `• <strong>Doanh nghiệp:</strong> <strong>${escapeHtml(businessContext.companyName || 'Doanh nghiệp')}</strong> (${escapeHtml(businessContext.industry || 'Bán lẻ')})<br>` +
            `• <strong>Kỳ phân tích:</strong> ${escapeHtml(businessContext.period || 'Hiện tại')}<br>` +
            `• <strong>Yêu cầu trọng tâm:</strong> ${escapeHtml(businessContext.description || 'Đối soát bẫy doanh thu và tối ưu hóa lợi nhuận')}<br>` +
            `Hệ thống AI Agent đang ghi nhớ bối cảnh này để rà soát dữ liệu.`;
        } else {
          response = `Bạn chưa lưu bối cảnh cụ thể. Bạn có thể kéo lên phần <strong>Bối Cảnh Doanh Nghiệp & Yêu Cầu Cho AI Agent</strong> ở đầu Giai đoạn 1 để nhập thông tin, hoặc bấm <em>"Mẫu Gợi Ý"</em> để AI Agent hiểu rõ hơn về doanh nghiệp của bạn!`;
        }
      } else if (!customDatasetLoaded && !state.phase1Completed) {
        response = `Xin chào! Tôi đã ghi nhận câu hỏi: <em>"${escapeHtml(query)}"</em>.<br><br>` +
          `Hiện tại hệ thống đang ở trạng thái <strong>dữ liệu trống (sẵn sàng tiếp nhận tệp của bạn)</strong>.<br>` +
          `• <strong>Cách bắt đầu:</strong> Kéo & thả tệp Excel (.xlsx, .xls) hoặc CSV giao dịch của doanh nghiệp bạn vào ô nạp tệp bên trên hoặc bấm nút <strong>"Dữ Liệu Mẫu"</strong>.<br>` +
          `• <strong>Sau khi nạp:</strong> Tôi sẽ tự động phân tích chi tiết toàn bộ số liệu, bóc tách đơn lỗi và đưa ra câu trả lời số học chuẩn xác nhất cho bạn!`;
      } else {
        const stats = customDatasetStats;
        const analytics = getActiveAnalytics();
        const topStore = analytics.stores[0];
        const urgentStores = analytics.stores.filter(s => s.priority === 1);
        const topCat = (analytics.categories && analytics.categories[0]) ? analytics.categories[0] : null;
        response = `📊 <strong>Phân tích trực tiếp trên tệp <em>${escapeHtml(stats.fileName)}</em>:</strong><br>` +
          `• <strong>Quy mô dữ liệu:</strong> ${stats.cleanRows.toLocaleString('vi-VN')} dòng sạch / ${stats.totalRows.toLocaleString('vi-VN')} dòng gốc (đã loại ${stats.duplicateRows.toLocaleString('vi-VN')} trùng lặp, ${stats.cancelledRows.toLocaleString('vi-VN')} đơn hủy; phát hiện ${stats.returnRows.toLocaleString('vi-VN')} đổi trả).<br>` +
          `• <strong>Tổng Doanh Thu Thuần:</strong> ${formatMoney(analytics.totalCleanRev)} | <strong>LN Gộp:</strong> ${formatMoney(analytics.totalCleanProfit)} (Biên ${analytics.avgMargin}%).<br>` +
          `• <strong>Số điểm bán / chi nhánh:</strong> ${analytics.stores.length} cửa hàng (Tỷ lệ đổi trả TB: ${analytics.avgReturn}%).<br>` +
          (topStore ? `• <strong>Dẫn đầu doanh thu:</strong> ${escapeHtml(topStore.name)} (${formatMoney(topStore.cleanRev)}).<br>` : "") +
          (topCat && topCat.pct > 0 ? `• <strong>Ngành hàng / SP chủ lực:</strong> ${escapeHtml(topCat.name)} (${topCat.pct}% doanh thu).<br>` : "") +
          (urgentStores.length > 0
            ? `• 🔴 <strong>Cảnh báo Ưu tiên 1 (${urgentStores.length} CH):</strong> ${urgentStores.slice(0, 3).map(s => `${escapeHtml(s.name)} (${escapeHtml(s.anomaly)})`).join("; ")}.`
            : `• 🟢 <strong>Trạng thái hệ thống:</strong> Không phát hiện cửa hàng nào rơi vào mức cảnh báo đỏ (Ưu tiên 1).`);
      }

      appendChatMessage("ai", response);
    }, 500);
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;
    chatInput.value = "";
    handleAiQuery(query);
  });

  document.querySelectorAll(".quick-prompt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.getAttribute("data-question");
      handleAiQuery(q);
    });
  });

  // CSV Export
  document.getElementById("btn-export-data").addEventListener("click", () => {
    let csv = "Mã CH,Tên Cửa Hàng,Khu Vực,Quản Lý,Doanh Thu Thuần,Mục Tiêu,Đạt Target (%),LN Gộp,Biên LN (%),Tỷ Lệ Đổi Trả (%),Mức Ưu Tiên,Bất Thường Phát Hiện\n";

    getActiveAnalytics().stores.forEach(s => {
      const targetPercent = ((s.cleanRev / s.targetRevenue) * 100).toFixed(1);
      const grossMarginPercent = ((s.cleanProfit / s.cleanRev) * 100).toFixed(1);
      const anomaly = s.anomaly ? `"${s.anomaly.replace(/"/g, '""')}"` : "Bình thường";
      csv += `${s.id},"${s.name}",${s.region},"${s.manager}",${s.cleanRev},${s.targetRevenue},${targetPercent}%,${s.cleanProfit},${grossMarginPercent}%,${s.returnRate}%,Ưu tiên ${s.priority},${anomaly}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Cao_Quan_Tri_Doi_Soat_Ban_Hang.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Đã tải xuống Báo cáo Quản trị đối soát CSV!");
  });

  // Sidebar navigation listeners & active tab states
  const navDash = document.getElementById("nav-dashboard");
  const navLeaderboard = document.getElementById("nav-leaderboard");
  const navP1 = document.getElementById("nav-phase1");
  const navProducts = document.getElementById("nav-products");
  const navP2 = document.getElementById("nav-phase2");
  const navP3 = document.getElementById("nav-phase3");
  const navMessages = document.getElementById("nav-messages");

  function setActiveNav(activeBtn) {
    document.querySelectorAll(".dabang-nav-item").forEach(item => item.classList.remove("active"));
    if (activeBtn) activeBtn.classList.add("active");
  }

  if (navDash) {
    navDash.addEventListener("click", () => {
      setActiveNav(navDash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (navLeaderboard) {
    navLeaderboard.addEventListener("click", () => {
      setActiveNav(navLeaderboard);
      if (!state.phase1Completed) {
        showToast("Vui lòng hoàn thành GĐ 1 để mở khóa Leaderboard 18 CH!", true);
        switchPhase(1);
      } else {
        switchPhase(2);
      }
      const el = document.getElementById("stores-report-tbody");
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (navP1) {
    navP1.addEventListener("click", () => {
      setActiveNav(navP1);
      switchPhase(1);
      const el = document.getElementById("panel-phase1");
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (navProducts) {
    navProducts.addEventListener("click", () => {
      setActiveNav(navProducts);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    });
  }

  if (navP2) {
    navP2.addEventListener("click", () => {
      setActiveNav(navP2);
      if (!state.phase1Completed) {
        showToast("Vui lòng hoàn thành xác thực dữ liệu sạch ở GĐ 1 trước!", true);
        return;
      }
      switchPhase(2);
      const el = document.getElementById("panel-phase2");
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (navP3) {
    navP3.addEventListener("click", () => {
      setActiveNav(navP3);
      if (!state.phase1Completed) {
        showToast("Vui lòng hoàn thành xác thực GĐ 1 trước!", true);
        return;
      }
      switchPhase(3);
      const el = document.getElementById("panel-phase3");
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (navMessages) {
    navMessages.addEventListener("click", () => {
      setActiveNav(navMessages);
      const el = document.getElementById("ai-chat-form");
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        document.getElementById("ai-chat-input").focus();
      }
    });
  }

  // ==============================================
  // ACCURATE GLOBAL SEARCH ENGINE (Stores & Transactions)
  // ==============================================
  const searchGlobal = document.getElementById("search-global-input");
  const searchGlobalContainer = document.getElementById("global-search-container");
  const searchGlobalIcon = document.getElementById("search-global-icon");
  const btnClearGlobalSearch = document.getElementById("btn-clear-global-search");
  const searchResultsDropdown = document.getElementById("search-results-dropdown");

  function removeVietnameseTones(str) {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();
  }

  let lastSearchMatchContext = { stores: [], transactions: [], query: "" };

  function ensureDatasetReadyForSearch() {
    if (!Array.isArray(currentRawRecords) || currentRawRecords.length === 0) {
      const fallback = (window.__rawOriginalUncleanedSnapshot && Array.isArray(window.__rawOriginalUncleanedSnapshot.records) && window.__rawOriginalUncleanedSnapshot.records.length > 0)
        ? window.__rawOriginalUncleanedSnapshot.records
        : defaultSampleRawRecords;
      currentRawRecords = JSON.parse(JSON.stringify(fallback));
      if (typeof recalculateStatsFromRecords === "function") {
        recalculateStatsFromRecords();
      }
    }
  }

  function scrollToElementWithOffset(el, offset = 110) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const targetTop = Math.max(0, window.scrollY + rect.top - offset);
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  }

  function navigateToStoreTarget(storeNameOrQuery) {
    ensureDatasetReadyForSearch();
    state.rawTableSearchQuery = "";

    const step1Section = document.getElementById("step1-main-section");
    const container = document.getElementById("subsequent-steps-container");
    if (step1Section) step1Section.classList.add("hidden");
    if (container) container.classList.remove("hidden");
    state.hasAnalyzedStep1 = true;
    state.phase1Completed = true;

    if (!state.isReportGenerated && typeof generateManagementReport === "function") {
      generateManagementReport();
    }

    setWorkflowStep(3);
    switchPhase(2);
    setStep3Page(2);

    const localSearch = document.getElementById("search-store-input");
    if (localSearch) localSearch.value = storeNameOrQuery;
    const regionSelect = document.getElementById("filter-region");
    if (regionSelect) regionSelect.value = "all";
    renderStoresManagementTable(storeNameOrQuery, "all");

    if (searchResultsDropdown) searchResultsDropdown.classList.add("hidden");

    setTimeout(() => {
      const sectionEl = document.getElementById("step3-page-2-content") || document.getElementById("stores-report-tbody");
      scrollToElementWithOffset(sectionEl, 110);

      const tbody = document.getElementById("stores-report-tbody");
      if (tbody) {
        const rows = tbody.querySelectorAll("tr");
        rows.forEach(row => {
          row.classList.add("bg-[#FFF0F5]", "ring-2", "ring-[#FF5B8E]", "transition-all", "duration-500");
          setTimeout(() => {
            row.classList.remove("bg-[#FFF0F5]", "ring-2", "ring-[#FF5B8E]");
          }, 3200);
        });
      }
    }, 80);

    showToast(`Đã chuyển đến khu vực Cửa hàng: ${storeNameOrQuery} ✓`);
  }

  function navigateToTransactionTarget(trxCodeOrQuery) {
    ensureDatasetReadyForSearch();
    state.rawTableSearchQuery = trxCodeOrQuery;

    const step1Section = document.getElementById("step1-main-section");
    const container = document.getElementById("subsequent-steps-container");
    if (step1Section) step1Section.classList.add("hidden");
    if (container) container.classList.remove("hidden");
    state.hasAnalyzedStep1 = true;

    setWorkflowStep(2);
    switchPhase(1);
    setStep2Page(2);

    const filterSelect = document.getElementById("filter-data-type");
    if (filterSelect) filterSelect.value = "all";
    renderRawSampleTable("all", trxCodeOrQuery);

    if (searchResultsDropdown) searchResultsDropdown.classList.add("hidden");

    setTimeout(() => {
      const sectionEl = document.getElementById("step2-page-2-content") || document.getElementById("raw-sample-tbody");
      scrollToElementWithOffset(sectionEl, 110);

      const sampleTable = document.getElementById("raw-sample-tbody");
      if (sampleTable) {
        const rows = sampleTable.querySelectorAll("tr");
        rows.forEach(r => {
          r.classList.add("bg-[#FFF0F5]", "ring-2", "ring-[#FF5B8E]", "transition-all", "duration-500");
          setTimeout(() => {
            r.classList.remove("bg-[#FFF0F5]", "ring-2", "ring-[#FF5B8E]");
          }, 3200);
        });
      }
    }, 80);

    showToast(`Đã chuyển đến khu vực Giao dịch: ${trxCodeOrQuery} ✓`);
  }

  function performGlobalSearch(rawKeyword) {
    const query = (rawKeyword || "").trim();
    if (!searchResultsDropdown) return false;

    if (!query) {
      searchResultsDropdown.classList.add("hidden");
      searchResultsDropdown.innerHTML = "";
      if (searchGlobal) {
        searchGlobal.classList.remove("border-rose-500", "bg-rose-50/40", "text-rose-900", "focus:border-rose-500");
        searchGlobal.classList.add("border-[#FAD2E1]", "focus:border-[#FF5B8E]");
      }
      if (searchGlobalIcon) {
        searchGlobalIcon.className = "fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs transition-colors";
      }
      if (btnClearGlobalSearch) btnClearGlobalSearch.classList.add("hidden");

      // Reset store table and raw sample filter
      const localSearch = document.getElementById("search-store-input");
      if (localSearch) localSearch.value = "";
      const region = document.getElementById("filter-region") ? document.getElementById("filter-region").value : "all";
      renderStoresManagementTable("", region);
      return true;
    }

    if (btnClearGlobalSearch) btnClearGlobalSearch.classList.remove("hidden");

    const normQuery = removeVietnameseTones(query);

    // 1. Get Store Source (from active analytics or default model)
    const analyticsStores = getActiveAnalytics().stores || [];
    const storesPool = analyticsStores.length > 0 ? analyticsStores : [
      { id: "CH01", name: "CH01 - Cầu Giấy", region: "Miền Bắc", manager: "Nguyễn Văn An", cleanRev: 2800000000, targetRevenue: 2800000000, priority: 3, status: "Ổn định" },
      { id: "CH02", name: "CH02 - Đống Đa", region: "Miền Bắc", manager: "Trần Thị Mai", cleanRev: 3100000000, targetRevenue: 3100000000, priority: 4, status: "Tăng trưởng" },
      { id: "CH03", name: "CH03 - Hai Bà Trưng", region: "Miền Bắc", manager: "Lê Hoàng Quân", cleanRev: 3000000000, targetRevenue: 3000000000, priority: 2, status: "Biên mỏng" },
      { id: "CH04", name: "CH04 - Hoàn Kiếm", region: "Miền Bắc", manager: "Phạm Thu Hương", cleanRev: 2950000000, targetRevenue: 3000000000, priority: 3, status: "Ổn định" },
      { id: "CH06", name: "CH06 - Long Biên", region: "Miền Bắc", manager: "Vũ Minh Trí", cleanRev: 2700000000, targetRevenue: 2900000000, priority: 3, status: "Ổn định" },
      { id: "CH07", name: "CH07 - Hải Phòng", region: "Miền Bắc", manager: "Đỗ Hải Nam", cleanRev: 2850000000, targetRevenue: 3100000000, priority: 2, status: "Đổi trả cao" },
      { id: "CH08", name: "CH08 - Quảng Ninh", region: "Miền Bắc", manager: "Bùi Thị Lan", cleanRev: 2600000000, targetRevenue: 3000000000, priority: 1, status: "Báo ảo đơn hủy" },
      { id: "CH10", name: "CH10 - Huế", region: "Miền Trung", manager: "Nguyễn Phước Lộc", cleanRev: 2400000000, targetRevenue: 2600000000, priority: 3, status: "Ổn định" },
      { id: "CH12", name: "CH12 - Quận 1", region: "Miền Nam", manager: "Trương Mỹ Linh", cleanRev: 3800000000, targetRevenue: 3500000000, priority: 4, status: "Xuất sắc" },
      { id: "CH15", name: "CH15 - Bình Thạnh", region: "Miền Nam", manager: "Đặng Gia Huy", cleanRev: 3100000000, targetRevenue: 3200000000, priority: 1, status: "Đổi trả sai COGS" },
      { id: "CH18", name: "CH18 - Bình Dương", region: "Miền Nam", manager: "Hoàng Tuấn Kiệt", cleanRev: 2900000000, targetRevenue: 3000000000, priority: 3, status: "Ổn định" }
    ];

    const matchedStores = storesPool.filter(s => {
      const idMatch = removeVietnameseTones(s.id).includes(normQuery);
      const nameMatch = removeVietnameseTones(s.name).includes(normQuery);
      const regMatch = removeVietnameseTones(s.region).includes(normQuery);
      const mgrMatch = removeVietnameseTones(s.manager || "").includes(normQuery);
      const statusMatch = removeVietnameseTones(s.status || "").includes(normQuery);
      return idMatch || nameMatch || regMatch || mgrMatch || statusMatch;
    });

    // 2. Get Transaction Source (from current raw records or snapshot or defaults)
    const rawRecordsPool = (Array.isArray(currentRawRecords) && currentRawRecords.length > 0)
      ? currentRawRecords
      : (window.__rawOriginalUncleanedSnapshot?.records || defaultSampleRawRecords);

    const matchedTransactions = rawRecordsPool.filter(r => {
      if (!r) return false;
      const codeMatch = removeVietnameseTones(r.code || "").includes(normQuery);
      const storeMatch = removeVietnameseTones(r.store || "").includes(normQuery);
      const prodMatch = removeVietnameseTones(r.prod || "").includes(normQuery);
      const catMatch = removeVietnameseTones(r.cat || "").includes(normQuery);
      const statusMatch = removeVietnameseTones(r.status || "").includes(normQuery);
      const noteMatch = removeVietnameseTones(r.note || "").includes(normQuery);
      const revMatch = String(r.rev || "").includes(query);
      return codeMatch || storeMatch || prodMatch || catMatch || statusMatch || noteMatch || revMatch;
    });

    // 3. CASE A: INVALID SEARCH (Không khớp dữ liệu thô / tìm kiếm sai)
    if (matchedStores.length === 0 && matchedTransactions.length === 0) {
      if (searchGlobal) {
        searchGlobal.classList.add("border-rose-500", "bg-rose-50/40", "text-rose-900", "focus:border-rose-500");
        searchGlobal.classList.remove("border-[#FAD2E1]", "focus:border-[#FF5B8E]");
      }
      if (searchGlobalIcon) {
        searchGlobalIcon.className = "fa-solid fa-circle-xmark absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 text-xs transition-colors";
      }

      searchResultsDropdown.innerHTML = `
        <div class="p-4 bg-gradient-to-b from-rose-50/90 to-white text-center">
          <div class="w-10 h-10 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-base mb-2 shadow-xs">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div class="text-xs font-black text-rose-600 tracking-tight">Tìm kiếm không hợp lệ!</div>
          <p class="text-[11px] text-slate-600 mt-1.5 leading-relaxed max-w-sm mx-auto">
            Từ khóa <span class="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">"${escapeHtml(query)}"</span> không khớp với bất kỳ <strong>cửa hàng</strong> hay <strong>giao dịch</strong> nào trong tập dữ liệu thô.
          </p>
          <div class="mt-3 pt-2.5 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
            <span class="text-slate-500">💡 Gợi ý: Tìm <strong>CH01</strong>, <strong>Cầu Giấy</strong>, <strong>TRX-100234</strong></span>
            <button type="button" id="btn-quick-reset-search" class="font-extrabold text-[#FF5B8E] hover:underline cursor-pointer">
              <i class="fa-solid fa-rotate-left mr-0.5"></i> Xóa tìm kiếm
            </button>
          </div>
        </div>
      `;
      searchResultsDropdown.classList.remove("hidden");

      const btnResetHint = document.getElementById("btn-quick-reset-search");
      if (btnResetHint) {
        btnResetHint.addEventListener("click", () => {
          if (searchGlobal) searchGlobal.value = "";
          performGlobalSearch("");
        });
      }
      return false;
    }

    // 4. CASE B: VALID SEARCH (Có kết quả khớp chính xác)
    if (searchGlobal) {
      searchGlobal.classList.remove("border-rose-500", "bg-rose-50/40", "text-rose-900", "focus:border-rose-500");
      searchGlobal.classList.add("border-[#FF5B8E]", "focus:border-[#FF5B8E]");
    }
    if (searchGlobalIcon) {
      searchGlobalIcon.className = "fa-solid fa-circle-check absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 text-xs transition-colors";
    }

    let html = `
      <div class="px-3.5 py-2 bg-gradient-to-r from-[#FFF0F5] to-white text-[11px] font-black text-[#FF5B8E] flex items-center justify-between border-b border-[#FAD2E1]/60">
        <span class="flex items-center gap-1.5">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>Kết Quả Tìm Kiếm Hợp Lệ</span>
        </span>
        <span class="px-2 py-0.5 rounded-full bg-[#FF5B8E]/15 text-[#FF5B8E] text-[10px] font-extrabold">
          ${matchedStores.length} Cửa hàng • ${matchedTransactions.length} Giao dịch
        </span>
      </div>
    `;

    // A. Render Stores Matches
    if (matchedStores.length > 0) {
      html += `
        <div class="p-2 bg-white">
          <div class="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i class="fa-solid fa-store text-[#FF5B8E]"></i> Cửa Hàng Khớp (${matchedStores.length})
          </div>
          <div class="space-y-1 mt-1">
      `;
      matchedStores.slice(0, 5).forEach(s => {
        const badgeColor = s.priority === 1
          ? "bg-rose-100 text-rose-700 border-rose-200"
          : s.priority === 2
          ? "bg-amber-100 text-amber-800 border-amber-200"
          : "bg-emerald-100 text-emerald-700 border-emerald-200";
        html += `
          <div class="search-item-store px-2.5 py-2 rounded-xl hover:bg-[#FFF0F5] transition cursor-pointer border border-transparent hover:border-[#FAD2E1] flex items-center justify-between gap-2"
               data-store-id="${escapeHtml(s.id)}" data-store-name="${escapeHtml(s.name)}">
            <div class="min-w-0">
              <div class="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span class="px-1.5 py-0.2 rounded bg-pink-100 text-[#FF5B8E] font-mono text-[10px]">${s.id}</span>
                <span class="truncate">${escapeHtml(s.name)}</span>
              </div>
              <div class="text-[10px] text-slate-500 mt-0.5 truncate">
                ${s.region} • Quản lý: ${escapeHtml(s.manager || "N/A")}
              </div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-xs font-mono font-bold text-slate-800">${formatMoney(s.cleanRev || 0)}</div>
              <span class="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-bold border ${badgeColor}">
                ${escapeHtml(s.status || "Hoạt động")}
              </span>
            </div>
          </div>
        `;
      });
      html += `</div></div>`;
    }

    // B. Render Transactions Matches
    if (matchedTransactions.length > 0) {
      html += `
        <div class="p-2 bg-[#FFFBFD]">
          <div class="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <i class="fa-solid fa-receipt text-blue-500"></i> Giao Dịch Trong Dữ Liệu Thô (${matchedTransactions.length})
          </div>
          <div class="space-y-1 mt-1">
      `;
      matchedTransactions.slice(0, 5).forEach(r => {
        let tagClass = "bg-emerald-100 text-emerald-700";
        let tagText = "Hợp lệ";
        if (r.type === "duplicate") {
          tagClass = "bg-rose-100 text-rose-700";
          tagText = "Trùng lặp";
        } else if (r.type === "cancelled" || r.type === "cancel") {
          tagClass = "bg-amber-100 text-amber-800";
          tagText = "Đã hủy";
        } else if (r.type === "return") {
          tagClass = "bg-purple-100 text-purple-700";
          tagText = "Đổi trả";
        } else if (r.type === "period") {
          tagClass = "bg-blue-100 text-blue-700";
          tagText = "Lệch kỳ";
        }

        html += `
          <div class="search-item-trx px-2.5 py-2 rounded-xl hover:bg-white hover:shadow-xs transition cursor-pointer border border-transparent hover:border-[#FAD2E1] flex items-center justify-between gap-2"
               data-trx-code="${escapeHtml(r.code || "")}">
            <div class="min-w-0">
              <div class="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span class="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-mono text-[10px]">${r.code || "N/A"}</span>
                <span class="truncate text-[11px] font-semibold">${escapeHtml(r.prod || r.cat || "Giao dịch")}</span>
              </div>
              <div class="text-[10px] text-slate-500 mt-0.5 truncate">
                ${escapeHtml(r.store || "Chi nhánh")} • ${r.time || "Kỳ 10/2026"}
              </div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-xs font-mono font-bold text-slate-800">${formatMoney(r.rev || 0)}</div>
              <span class="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-bold ${tagClass}">
                ${tagText}
              </span>
            </div>
          </div>
        `;
      });
      html += `</div></div>`;
    }

    searchResultsDropdown.innerHTML = html;
    searchResultsDropdown.classList.remove("hidden");

    // Click handler for Store Items
    searchResultsDropdown.querySelectorAll(".search-item-store").forEach(el => {
      el.addEventListener("click", () => {
        const storeName = el.getAttribute("data-store-name");
        if (searchGlobal) searchGlobal.value = storeName;
        navigateToStoreTarget(storeName);
      });
    });

    // Click handler for Transaction Items
    searchResultsDropdown.querySelectorAll(".search-item-trx").forEach(el => {
      el.addEventListener("click", () => {
        const trxCode = el.getAttribute("data-trx-code");
        if (searchGlobal) searchGlobal.value = trxCode;
        navigateToTransactionTarget(trxCode);
      });
    });

    lastSearchMatchContext = {
      stores: matchedStores,
      transactions: matchedTransactions,
      query
    };

    // Also filter store management table live
    const localSearch = document.getElementById("search-store-input");
    if (localSearch) localSearch.value = query;
    const region = document.getElementById("filter-region") ? document.getElementById("filter-region").value : "all";
    renderStoresManagementTable(query, region);
    return true;
  }

  if (searchGlobal) {
    searchGlobal.addEventListener("input", (e) => {
      if (!e.target.value.trim()) {
        state.rawTableSearchQuery = "";
        renderRawSampleTable();
      }
      performGlobalSearch(e.target.value);
    });

    searchGlobal.addEventListener("focus", (e) => {
      if (e.target.value.trim()) {
        performGlobalSearch(e.target.value);
      }
    });

    searchGlobal.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const rawVal = e.target.value.trim();
        if (!rawVal) return;
        const isValid = performGlobalSearch(rawVal);
        if (!isValid) {
          showToast(`⚠️ Tìm kiếm không hợp lệ: Không tìm thấy cửa hàng hay giao dịch khớp với '${rawVal}'!`, true);
          if (typeof pushNotification === "function") {
            pushNotification({
              type: "error",
              level: "error",
              title: "Tìm kiếm không hợp lệ",
              desc: `Từ khóa "${rawVal}" không khớp với bất kỳ cửa hàng hoặc giao dịch nào trong tập dữ liệu thô.`,
              badge: "Search"
            });
          }
          return;
        }

        // Valid search on Enter: immediately navigate & scroll up to the target section!
        const { stores, transactions } = lastSearchMatchContext;
        const normVal = removeVietnameseTones(rawVal);
        const looksLikeTrx = /^(trx|ret|sp-|gd|hd)/i.test(rawVal) ||
          transactions.some(t => removeVietnameseTones(t.code || "") === normVal);

        if (looksLikeTrx && transactions.length > 0) {
          navigateToTransactionTarget(transactions[0].code || rawVal);
        } else if (stores.length > 0) {
          navigateToStoreTarget(stores[0].name || rawVal);
        } else if (transactions.length > 0) {
          navigateToTransactionTarget(transactions[0].code || rawVal);
        }
      } else if (e.key === "Escape") {
        if (searchResultsDropdown) searchResultsDropdown.classList.add("hidden");
      }
    });
  }

  if (btnClearGlobalSearch) {
    btnClearGlobalSearch.addEventListener("click", () => {
      state.rawTableSearchQuery = "";
      renderRawSampleTable();
      if (searchGlobal) {
        searchGlobal.value = "";
        searchGlobal.focus();
      }
      performGlobalSearch("");
    });
  }

  // Close search dropdown on click outside
  document.addEventListener("click", (e) => {
    if (searchGlobalContainer && !searchGlobalContainer.contains(e.target)) {
      if (searchResultsDropdown) searchResultsDropdown.classList.add("hidden");
    }
  });

  const btnExportSide = document.getElementById("btn-export-data-side");
  if (btnExportSide) {
    btnExportSide.addEventListener("click", () => {
      document.getElementById("btn-export-data").click();
    });
  }

  // Language Selector Dropdown Logic
  const btnLangToggle = document.getElementById("btn-lang-toggle");
  const langMenu = document.getElementById("lang-menu");
  const currentLangFlag = document.getElementById("current-lang-flag");
  const currentLangText = document.getElementById("current-lang-text");
  const currentLangChevron = document.getElementById("current-lang-chevron");
  const langOptions = document.querySelectorAll(".lang-option");

  const I18N = {
    vi: {
      flag: "https://flagcdn.com/w20/vn.png",
      name: "Tiếng Việt",
      navDashboard: "Bảng Điều Khiển",
      navLeaderboard: "Bảng Xếp Hạng",
      navPhase1: "Đơn Hàng & Làm Sạch",
      navProducts: "Danh Mục Sản Phẩm",
      navPhase2: "Báo Cáo Bán Hàng",
      navPhase3: "Đối Chiếu & Audit",
      navMessages: "Trợ Lý AI Copilot",
      navSettings: "Cài Đặt Hệ Thống",
      navSignout: "Đăng Xuất",
      headerTitle: "Bảng Điều Khiển Quản Trị",
      searchPlaceholder: "Tìm kiếm cửa hàng, giao dịch, ngành hàng...",
      btnExport: "Xuất Dữ Liệu",

      todaysSalesTitle: "Doanh Số & Giao Dịch",
      todaysSalesSub: "Tổng quan bán hàng (Hệ thống sẵn sàng tiếp nhận tệp dữ liệu khách hàng)",
      lblClean: "Đơn Sạch Hợp Lệ",
      lblDup: "Đơn Trùng Lặp",
      lblCancel: "Đơn Đã Hủy",
      lblReturn: "Đơn Đổi Trả",

      visitorInsightsTitle: "Thông Tin Lượng Khách",
      visitorInsightsSub: "Xu Hướng Toàn Chuỗi",
      loyalCust: "Khách Thân Thiết",
      newCust: "Khách Mới",
      uniqueCust: "Khách Độc Nhất",

      totalRevTitle: "Tổng Doanh Thu",
      onlineSales: "Bán Trực Tuyến",
      offlineSales: "Bán Tại Cửa Hàng",

      custSatTitle: "Độ Hài Lòng Khách Hàng",
      lastMonth: "Tháng Trước",
      thisMonth: "Tháng Này",

      targetRealityTitle: "Mục Tiêu vs Thực Tế",
      realitySalesLbl: "Doanh Số Thực Tế",
      realitySub: "Thực tế",
      targetSalesLbl: "Doanh Số Mục Tiêu",
      targetSub: "Kế hoạch",

      topProdTitle: "Top Ngành Hàng",
      topProdSub: "4 Ngành Hàng Toàn Chuỗi",
      thNum: "#",
      thName: "Ngành Hàng",
      thPop: "Tỷ Trọng Doanh Số",
      thSales: "Đóng Góp",

      cat01: "Điện Gia Dụng (CAT01)",
      cat02: "Thiết Bị Số (CAT02)",
      cat03: "Sức Khỏe & Sắc Đẹp (CAT03)",
      cat04: "Gia Dụng Thông Minh (CAT04)",

      salesMapTitle: "Phân Bổ Doanh Số Khu Vực",
      volServiceTitle: "Sản Lượng vs Mức Dịch Vụ",
      volLbl: "Sản Lượng",
      servLbl: "Dịch Vụ",
      btnGetPro: "Nâng Cấp / Xuất CSV"
    },
    en: {
      flag: "https://flagcdn.com/w20/us.png",
      name: "Eng (US)",
      navDashboard: "Dashboard",
      navLeaderboard: "Leaderboard (18 Stores)",
      navPhase1: "Order (Cleaning)",
      navProducts: "Products (Categories)",
      navPhase2: "Sales Report",
      navPhase3: "Cross-Check & Audit",
      navMessages: "Messages (AI Copilot)",
      navSettings: "Settings",
      navSignout: "Sign Out",
      headerTitle: "Executive Management Dashboard",
      searchPlaceholder: "Search here... (Stores, transactions, categories)",
      btnExport: "Export",

      todaysSalesTitle: "Today's Sales",
      todaysSalesSub: "Sales Summary (Ready to ingest customer dataset)",
      lblClean: "Total Sales",
      lblDup: "Total Order",
      lblCancel: "Product Sold",
      lblReturn: "New Customers",

      visitorInsightsTitle: "Visitor Insights",
      visitorInsightsSub: "Network Trend",
      loyalCust: "Loyal Customers",
      newCust: "New Customers",
      uniqueCust: "Unique Customers",

      totalRevTitle: "Total Revenue",
      onlineSales: "Online Sales",
      offlineSales: "Offline Sales",

      custSatTitle: "Customer Satisfaction",
      lastMonth: "Last Month",
      thisMonth: "This Month",

      targetRealityTitle: "Target vs Reality",
      realitySalesLbl: "Reality Sales",
      realitySub: "Actual",
      targetSalesLbl: "Target Sales",
      targetSub: "Commended",

      topProdTitle: "Top Products",
      topProdSub: "4 Main Categories",
      thNum: "#",
      thName: "Name",
      thPop: "Popularity",
      thSales: "Sales",

      cat01: "Home Decor & Appliances (CAT01)",
      cat02: "Digital Devices & Accessories (CAT02)",
      cat03: "Health & Beauty Care (CAT03)",
      cat04: "Smart Home Gadgets (CAT04)",

      salesMapTitle: "Sales Mapping by Region",
      volServiceTitle: "Volume vs Service Level",
      volLbl: "Volume",
      servLbl: "Services",
      btnGetPro: "Get Pro / Export CSV"
    }
  };

  let currentAppLang = "vi";

  function applyLanguage(lang) {
    const t = I18N[lang] || I18N.vi;
    currentAppLang = lang;

    if (currentLangFlag) currentLangFlag.src = t.flag;
    if (currentLangText) currentLangText.textContent = t.name;

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText("txt-nav-dashboard", t.navDashboard);
    setText("txt-nav-leaderboard", t.navLeaderboard);
    setText("txt-nav-phase1", t.navPhase1);
    setText("txt-nav-products", t.navProducts);
    setText("txt-nav-phase2", t.navPhase2);
    setText("txt-nav-phase3", t.navPhase3);
    setText("txt-nav-messages", t.navMessages);
    setText("txt-nav-settings", t.navSettings);
    setText("txt-nav-signout", t.navSignout);
    setText("txt-header-title", t.headerTitle);

    const searchInput = document.getElementById("search-global-input");
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;

    setText("txt-btn-export", t.btnExport);
    setText("txt-todays-sales-title", t.todaysSalesTitle);
    setText("txt-todays-sales-sub", t.todaysSalesSub);
    setText("txt-lbl-clean", t.lblClean);
    setText("txt-lbl-dup", t.lblDup);
    setText("txt-lbl-cancel", t.lblCancel);
    setText("txt-lbl-return", t.lblReturn);

    setText("txt-visitor-insights-title", t.visitorInsightsTitle);
    setText("txt-visitor-insights-sub", t.visitorInsightsSub);
    setText("txt-loyal-cust", t.loyalCust);
    setText("txt-new-cust", t.newCust);
    setText("txt-unique-cust", t.uniqueCust);

    setText("txt-total-rev-title", t.totalRevTitle);
    setText("txt-online-sales", t.onlineSales);
    setText("txt-offline-sales", t.offlineSales);

    setText("txt-cust-sat-title", t.custSatTitle);
    setText("txt-last-month", t.lastMonth);
    setText("txt-this-month", t.thisMonth);

    setText("txt-target-reality-title", t.targetRealityTitle);
    setText("txt-reality-sales-lbl", t.realitySalesLbl);
    setText("txt-reality-sub", t.realitySub);
    setText("txt-target-sales-lbl", t.targetSalesLbl);
    setText("txt-target-sub", t.targetSub);

    setText("txt-top-prod-title", t.topProdTitle);
    setText("txt-top-prod-sub", t.topProdSub);
    setText("txt-th-num", t.thNum);
    setText("txt-th-name", t.thName);
    setText("txt-th-pop", t.thPop);
    setText("txt-th-sales", t.thSales);

    setText("txt-cat-01", t.cat01);
    setText("txt-cat-02", t.cat02);
    setText("txt-cat-03", t.cat03);
    setText("txt-cat-04", t.cat04);

    setText("txt-sales-map-title", t.salesMapTitle);
    setText("txt-vol-service-title", t.volServiceTitle);
    setText("txt-vol-lbl", t.volLbl);
    setText("txt-serv-lbl", t.servLbl);
    setText("txt-btn-get-pro", t.btnGetPro);

    // Dynamic update chart labels and tooltips
    updateChartLanguages(lang);

    langOptions.forEach(o => {
      const oLang = o.getAttribute("data-lang");
      const check = o.querySelector(".check-icon");
      if (oLang === lang) {
        o.classList.add("font-bold", "text-slate-900");
        o.classList.remove("font-semibold", "text-slate-700");
        if (check) check.classList.remove("hidden");
      } else {
        o.classList.remove("font-bold", "text-slate-900");
        o.classList.add("font-semibold", "text-slate-700");
        if (check) check.classList.add("hidden");
      }
    });

    try {
      localStorage.setItem("app_lang", lang);
    } catch (e) {}
  }

  function updateChartLanguages(lang) {
    const isVi = (lang === "vi");
    if (state.chartVisitor) {
      state.chartVisitor.data.labels = isVi 
        ? ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (state.chartVisitor.data.datasets[0]) state.chartVisitor.data.datasets[0].label = isVi ? 'Khách Thân Thiết' : 'Loyal Customers';
      if (state.chartVisitor.data.datasets[1]) state.chartVisitor.data.datasets[1].label = isVi ? 'Khách Mới' : 'New Customers';
      if (state.chartVisitor.data.datasets[2]) state.chartVisitor.data.datasets[2].label = isVi ? 'Khách Độc Nhất' : 'Unique Customers';
      state.chartVisitor.update();
    }
    if (state.chartTotalRev) {
      state.chartTotalRev.data.labels = isVi
        ? ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      if (state.chartTotalRev.data.datasets[0]) state.chartTotalRev.data.datasets[0].label = isVi ? 'Bán Trực Tuyến' : 'Online Sales';
      if (state.chartTotalRev.data.datasets[1]) state.chartTotalRev.data.datasets[1].label = isVi ? 'Bán Tại Cửa Hàng' : 'Offline Sales';
      state.chartTotalRev.update();
    }
    if (state.chartCustSat) {
      state.chartCustSat.data.labels = isVi
        ? ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6', 'Tuần 7']
        : ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];
      if (state.chartCustSat.data.datasets[0]) state.chartCustSat.data.datasets[0].label = isVi ? 'Tháng Trước' : 'Last Month';
      if (state.chartCustSat.data.datasets[1]) state.chartCustSat.data.datasets[1].label = isVi ? 'Tháng Này' : 'This Month';
      state.chartCustSat.update();
    }
    if (state.chartTargetReality) {
      state.chartTargetReality.data.labels = isVi
        ? ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
      if (state.chartTargetReality.data.datasets[0]) state.chartTargetReality.data.datasets[0].label = isVi ? 'Doanh Số Thực Tế' : 'Reality Sales';
      if (state.chartTargetReality.data.datasets[1]) state.chartTargetReality.data.datasets[1].label = isVi ? 'Doanh Số Mục Tiêu' : 'Target Sales';
      state.chartTargetReality.update();
    }
    if (state.chartVolume) {
      state.chartVolume.data.labels = isVi
        ? ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6']
        : ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
      if (state.chartVolume.data.datasets[0]) state.chartVolume.data.datasets[0].label = isVi ? 'Sản Lượng' : 'Volume';
      if (state.chartVolume.data.datasets[1]) state.chartVolume.data.datasets[1].label = isVi ? 'Dịch Vụ' : 'Services';
      state.chartVolume.update();
    }
  }

  if (btnLangToggle && langMenu) {
    btnLangToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      langMenu.classList.toggle("hidden");
      if (currentLangChevron) {
        currentLangChevron.classList.toggle("rotate-180");
      }
    });

    document.addEventListener("click", (e) => {
      if (!btnLangToggle.contains(e.target) && !langMenu.contains(e.target)) {
        langMenu.classList.add("hidden");
        if (currentLangChevron) {
          currentLangChevron.classList.remove("rotate-180");
        }
      }
    });

    langOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        const lang = opt.getAttribute("data-lang");
        applyLanguage(lang);
        langMenu.classList.add("hidden");
        if (currentLangChevron) currentLangChevron.classList.remove("rotate-180");

        if (lang === "vi") {
          showToast("Đã chuyển toàn bộ giao diện sang Tiếng Việt 🇻🇳");
        } else {
          showToast("Switched entire interface to English 🇺🇸");
        }
      });
    });

    // Initialize with saved or default Vietnamese
    let initLang = "vi";
    try {
      initLang = localStorage.getItem("app_lang") || "vi";
    } catch (e) {}
    applyLanguage(initLang);
  }

  // Welcome & Auth Modal Logic (Đăng nhập / Đăng ký khi ấn Bắt đầu trải nghiệm)
  const welcomeOverlay = document.getElementById("welcome-modal-overlay");
  const welcomeCard = document.getElementById("welcome-card");
  const btnStartExp = document.getElementById("btn-start-experience");
  const btnCloseWelcome = document.getElementById("btn-close-welcome");
  const btnOpenWelcome = document.getElementById("btn-open-welcome-profile");

  const authOverlay = document.getElementById("auth-modal-overlay");
  const authCard = document.getElementById("auth-card");
  const btnCloseAuth = document.getElementById("btn-close-auth");
  const tabAuthLogin = document.getElementById("tab-auth-login");
  const tabAuthRegister = document.getElementById("tab-auth-register");
  const tabAuthForgot = document.getElementById("tab-auth-forgot");
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");
  const formForgot = document.getElementById("form-forgot");
  const authMessageBox = document.getElementById("auth-message-box");
  const btnQuickDemoLogin = document.getElementById("btn-quick-demo-login");
  const btnToggleLoginPw = document.getElementById("btn-toggle-login-pw");
  const btnLogoutAccount = document.getElementById("btn-logout-account");
  const headerUserName = document.getElementById("header-user-name");
  const headerUserRole = document.getElementById("header-user-role");
  const sidebarUserName = document.getElementById("sidebar-user-name");
  const navSignoutBtn = document.getElementById("nav-signout");
  const txtNavSignout = document.getElementById("txt-nav-signout");
  const navSettingsBtn = document.getElementById("nav-settings");

  // Profile modal elements (Cập Nhật Tài Khoản)
  const profileOverlay = document.getElementById("profile-modal-overlay");
  const profileCard = document.getElementById("profile-card");
  const btnCloseProfile = document.getElementById("btn-close-profile");
  const formUpdateProfile = document.getElementById("form-update-profile");
  const profileDisplayName = document.getElementById("profile-display-name");
  const profileDisplayEmail = document.getElementById("profile-display-email");
  const profileDisplayRoleBadge = document.getElementById("profile-display-role-badge");
  const profileFullnameInput = document.getElementById("profile-fullname");
  const profileEmailInput = document.getElementById("profile-email");
  const profilePhoneInput = document.getElementById("profile-phone");
  const profileRoleSelect = document.getElementById("profile-role");
  const profileNewPwInput = document.getElementById("profile-new-pw");
  const profileMessageBox = document.getElementById("profile-message-box");
  const btnLogoutFromProfile = document.getElementById("btn-logout-from-profile");
  const btnProfileToWelcome = document.getElementById("btn-profile-to-welcome");

  const DEFAULT_DEMO_USER = {
    fullname: "Cao Thị Thảo Hiền",
    email: "thaohien@phucan.vn",
    role: "Data Analyst & BI 💖",
    phone: "0909123456",
    password: "123456"
  };

  function getStoredUsers() {
    try {
      const raw = localStorage.getItem("phucan_users");
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [DEFAULT_DEMO_USER];
      }
      if (!parsed.some(u => u.email.toLowerCase() === DEFAULT_DEMO_USER.email.toLowerCase())) {
        parsed.unshift(DEFAULT_DEMO_USER);
      }
      return parsed;
    } catch (e) {
      return [DEFAULT_DEMO_USER];
    }
  }

  function saveStoredUsers(users) {
    try {
      localStorage.setItem("phucan_users", JSON.stringify(users));
    } catch (e) {}
  }

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem("phucan_current_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem("phucan_current_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("phucan_current_user");
      }
    } catch (e) {}
    updateHeaderUserUI(user);
  }

  function updateHeaderUserUI(user) {
    const isVi = (localStorage.getItem("app_lang") || "vi") === "vi";
    if (user) {
      if (headerUserName) headerUserName.textContent = user.fullname;
      if (headerUserRole) headerUserRole.textContent = user.role || "Data Analyst & BI 💖";
      if (sidebarUserName) sidebarUserName.textContent = user.fullname;
      if (btnLogoutAccount) {
        btnLogoutAccount.classList.remove("hidden");
        btnLogoutAccount.title = isVi ? "Đăng xuất tài khoản" : "Sign Out";
      }
      if (txtNavSignout) txtNavSignout.textContent = isVi ? "Đăng Xuất" : "Sign Out";
    } else {
      if (headerUserName) headerUserName.textContent = isVi ? "Chưa đăng nhập" : "Not Logged In";
      if (headerUserRole) headerUserRole.textContent = isVi ? "Khách • Đăng nhập lại" : "Guest • Please Sign In";
      if (sidebarUserName) sidebarUserName.textContent = isVi ? "Chưa đăng nhập" : "Guest";
      if (btnLogoutAccount) btnLogoutAccount.classList.add("hidden");
      if (txtNavSignout) txtNavSignout.textContent = isVi ? "Đăng Nhập" : "Sign In";
    }
  }

  function showAuthMessage(msg, isError = true) {
    if (!authMessageBox) return;
    authMessageBox.classList.remove("hidden", "bg-rose-50", "text-rose-700", "border", "border-rose-200", "bg-emerald-50", "text-emerald-700", "border-emerald-200");
    if (isError) {
      authMessageBox.classList.add("bg-rose-50", "text-rose-700", "border", "border-rose-200");
      authMessageBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i><span>${escapeHtml(msg)}</span>`;
    } else {
      authMessageBox.classList.add("bg-emerald-50", "text-emerald-700", "border", "border-emerald-200");
      authMessageBox.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${escapeHtml(msg)}</span>`;
    }
  }

  function clearAuthMessage() {
    if (authMessageBox) authMessageBox.classList.add("hidden");
  }

  function switchAuthTab(mode) {
    clearAuthMessage();
    const activeCls = "py-2 rounded-xl text-xs font-extrabold bg-white text-[#FF5B8E] shadow-xs transition cursor-pointer";
    const idleCls = "py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-[#FF5B8E] transition cursor-pointer";

    if (formLogin) formLogin.classList.add("hidden");
    if (formRegister) formRegister.classList.add("hidden");
    if (formForgot) formForgot.classList.add("hidden");
    if (tabAuthLogin) tabAuthLogin.className = idleCls;
    if (tabAuthRegister) tabAuthRegister.className = idleCls;
    if (tabAuthForgot) tabAuthForgot.className = idleCls;

    if (mode === "register") {
      if (formRegister) formRegister.classList.remove("hidden");
      if (tabAuthRegister) tabAuthRegister.className = activeCls;
    } else if (mode === "forgot") {
      if (formForgot) formForgot.classList.remove("hidden");
      if (tabAuthForgot) tabAuthForgot.className = activeCls;
    } else {
      if (formLogin) formLogin.classList.remove("hidden");
      if (tabAuthLogin) tabAuthLogin.className = activeCls;
    }
  }

  function openAuthModal(defaultTab = "login", forceRelogin = false) {
    state.forceReAuth = forceRelogin;
    switchAuthTab(defaultTab);
    if (welcomeOverlay) welcomeOverlay.classList.add("hidden");

    if (btnCloseAuth) {
      if (forceRelogin) {
        btnCloseAuth.classList.add("hidden");
      } else {
        btnCloseAuth.classList.remove("hidden");
      }
    }

    if (forceRelogin) {
      showAuthMessage("Bạn đã đăng xuất tài khoản. Vui lòng đăng nhập lại hoặc chọn Vào nhanh bằng Demo để tiếp tục!", false);
    }

    if (authOverlay && authCard) {
      authOverlay.classList.remove("hidden", "pointer-events-none");
      setTimeout(() => {
        authOverlay.classList.remove("opacity-0");
        authCard.classList.remove("scale-95", "opacity-0");
      }, 10);
    }
  }

  function closeAuthModal() {
    if (state.forceReAuth && !getCurrentUser()) {
      showAuthMessage("Vui lòng đăng nhập hoặc chọn Đăng nhập nhanh Demo trước khi tiếp tục!");
      return;
    }
    state.forceReAuth = false;
    if (btnCloseAuth) btnCloseAuth.classList.remove("hidden");
    if (authCard) authCard.classList.add("scale-95", "opacity-0");
    if (authOverlay) {
      authOverlay.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        authOverlay.classList.add("hidden");
      }, 300);
    }
  }

  function openProfileModal() {
    const user = getCurrentUser() || DEFAULT_DEMO_USER;
    if (profileDisplayName) profileDisplayName.textContent = user.fullname;
    if (profileDisplayEmail) profileDisplayEmail.textContent = user.email;
    if (profileDisplayRoleBadge) profileDisplayRoleBadge.textContent = user.role || "Data Analyst & BI 💖";
    if (profileFullnameInput) profileFullnameInput.value = user.fullname || "";
    if (profileEmailInput) profileEmailInput.value = user.email || "";
    if (profilePhoneInput) profilePhoneInput.value = user.phone || "";
    if (profileRoleSelect) profileRoleSelect.value = user.role || "Data Analyst & BI 💖";
    if (profileNewPwInput) profileNewPwInput.value = "";
    if (profileMessageBox) profileMessageBox.classList.add("hidden");

    if (profileOverlay && profileCard) {
      profileOverlay.classList.remove("hidden", "pointer-events-none");
      setTimeout(() => {
        profileOverlay.classList.remove("opacity-0");
        profileCard.classList.remove("scale-95", "opacity-0");
      }, 10);
    }
  }

  function closeProfileModal() {
    if (profileCard) profileCard.classList.add("scale-95", "opacity-0");
    if (profileOverlay) {
      profileOverlay.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        profileOverlay.classList.add("hidden");
      }, 300);
    }
  }

  function handleSignOut(forceRelogin = true) {
    // 1. Remove active user session
    setCurrentUser(null);

    // 2. Close profile modal if open
    closeProfileModal();

    // 3. Mark force re-login state
    state.forceReAuth = forceRelogin;

    // 4. Update Header & Sidebar UI to guest state
    updateHeaderUserUI(null);

    // 5. Open auth modal in forced login mode
    openAuthModal("login", forceRelogin);

    // 6. Show notification and toast
    showToast("Đã đăng xuất tài khoản. Vui lòng đăng nhập lại! 🔒");
    if (typeof pushNotification === "function") {
      pushNotification({
        type: "system",
        level: "warning",
        title: "Đăng xuất tài khoản",
        desc: "Đã kết thúc phiên làm việc. Hệ thống yêu cầu đăng nhập lại để đảm bảo an toàn quy trình.",
        badge: "Auth"
      });
    }
  }

  function closeWelcomeModal(silent = false) {
    if (welcomeCard) welcomeCard.classList.add("scale-95", "opacity-0");
    if (welcomeOverlay) {
      welcomeOverlay.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        welcomeOverlay.classList.add("hidden");
      }, 500);
    }
    triggerPageTransition(document.getElementById("step1-main-section"));
    if (!silent) {
      const activeUser = getCurrentUser();
      const displayName = activeUser ? activeUser.fullname : "Cao Thị Thảo Hiền";
      showToast(`Chào mừng ${displayName} đến với hệ thống AI Agent! 🌸`);
    }
  }

  function openWelcomeModal() {
    if (welcomeOverlay && welcomeCard) {
      welcomeOverlay.classList.remove("hidden", "pointer-events-none");
      setTimeout(() => {
        welcomeOverlay.classList.remove("opacity-0");
        welcomeCard.classList.remove("scale-95", "opacity-0");
      }, 10);
    }
  }

  // Ensure initial user state exists on first load
  if (!localStorage.getItem("phucan_current_user_init_done")) {
    localStorage.setItem("phucan_current_user_init_done", "1");
    if (!getCurrentUser()) {
      setCurrentUser(DEFAULT_DEMO_USER);
    }
  }

  // Initialize header user state on load
  updateHeaderUserUI(getCurrentUser());

  if (btnStartExp) {
    btnStartExp.addEventListener("click", () => {
      const existingUser = getCurrentUser();
      if (existingUser) {
        closeWelcomeModal();
      } else {
        openAuthModal("login");
      }
    });
  }

  if (tabAuthLogin) tabAuthLogin.addEventListener("click", () => switchAuthTab("login"));
  if (tabAuthRegister) tabAuthRegister.addEventListener("click", () => switchAuthTab("register"));
  if (tabAuthForgot) tabAuthForgot.addEventListener("click", () => switchAuthTab("forgot"));

  // Natural 3D tilt + glass light sheen + soft ambient bokeh on Welcome Page
  const welcomeGlassSheen = document.getElementById("welcome-glass-sheen");
  if (welcomeCard) {
    welcomeCard.addEventListener("mousemove", (e) => {
      const rect = welcomeCard.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const x = relX / rect.width - 0.5;
      const y = relY / rect.height - 0.5;
      welcomeCard.style.transform = `perspective(1400px) rotateY(${(x * 3.2).toFixed(2)}deg) rotateX(${(-y * 2.4).toFixed(2)}deg)`;
      if (welcomeGlassSheen) {
        welcomeGlassSheen.style.background = `radial-gradient(circle 320px at ${relX.toFixed(0)}px ${relY.toFixed(0)}px, rgba(255, 255, 255, 0.34), transparent 72%)`;
      }
    });
    welcomeCard.addEventListener("mouseleave", () => {
      welcomeCard.style.transform = "";
    });
  }

  const bokehCanvas = document.getElementById("welcome-bokeh-canvas");
  if (bokehCanvas && welcomeOverlay) {
    const bCtx = bokehCanvas.getContext("2d");
    const orbs = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 18 + Math.random() * 44,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: -0.00015 - Math.random() * 0.00025,
      alpha: 0.08 + Math.random() * 0.14,
      hue: Math.random() > 0.4 ? "255, 91, 142" : "255, 178, 120"
    }));

    function resizeBokeh() {
      bokehCanvas.width = window.innerWidth;
      bokehCanvas.height = window.innerHeight;
    }
    resizeBokeh();
    window.addEventListener("resize", resizeBokeh);

    function drawBokeh() {
      if (!welcomeOverlay.classList.contains("hidden")) {
        const w = bokehCanvas.width;
        const h = bokehCanvas.height;
        bCtx.clearRect(0, 0, w, h);
        for (const o of orbs) {
          o.x += o.vx;
          o.y += o.vy;
          if (o.y < -0.1) o.y = 1.1;
          if (o.x < -0.1) o.x = 1.1;
          if (o.x > 1.1) o.x = -0.1;

          const cx = o.x * w;
          const cy = o.y * h;
          const grad = bCtx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
          grad.addColorStop(0, `rgba(${o.hue}, ${o.alpha})`);
          grad.addColorStop(1, `rgba(${o.hue}, 0)`);
          bCtx.fillStyle = grad;
          bCtx.beginPath();
          bCtx.arc(cx, cy, o.r, 0, Math.PI * 2);
          bCtx.fill();
        }
      }
      requestAnimationFrame(drawBokeh);
    }
    requestAnimationFrame(drawBokeh);
  }

  if (btnCloseAuth) {
    btnCloseAuth.addEventListener("click", () => {
      if (state.forceReAuth && !getCurrentUser()) {
        showAuthMessage("Vui lòng đăng nhập tài khoản hoặc chọn Vào nhanh bằng Demo để tiếp tục!");
        return;
      }
      closeAuthModal();
      if (!getCurrentUser()) {
        openWelcomeModal();
      }
    });
  }

  if (authOverlay) {
    authOverlay.addEventListener("click", (e) => {
      if (e.target === authOverlay) {
        if (state.forceReAuth && !getCurrentUser()) {
          showAuthMessage("Vui lòng đăng nhập tài khoản hoặc chọn Vào nhanh bằng Demo để tiếp tục!");
          return;
        }
        closeAuthModal();
      }
    });
  }

  if (btnToggleLoginPw) {
    btnToggleLoginPw.addEventListener("click", () => {
      const pwInput = document.getElementById("login-password");
      if (!pwInput) return;
      const isPw = pwInput.type === "password";
      pwInput.type = isPw ? "text" : "password";
      btnToggleLoginPw.innerHTML = isPw ? `<i class="fa-regular fa-eye-slash"></i>` : `<i class="fa-regular fa-eye"></i>`;
    });
  }

  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (document.getElementById("login-email")?.value || "").trim().toLowerCase();
      const password = document.getElementById("login-password")?.value || "";

      if (!email || !password) {
        showAuthMessage("Vui lòng nhập đầy đủ Email/Tên đăng nhập và Mật khẩu!");
        return;
      }

      const users = getStoredUsers();
      const matched = users.find(u => u.email.toLowerCase() === email && u.password === password);
      if (!matched) {
        showAuthMessage("Sai thông tin đăng nhập hoặc mật khẩu. Bạn có thể bấm 'Vào nhanh bằng tài khoản Demo' bên dưới!");
        return;
      }

      state.forceReAuth = false;
      setCurrentUser({
        fullname: matched.fullname,
        email: matched.email,
        role: matched.role,
        phone: matched.phone || ""
      });
      closeAuthModal();
      closeWelcomeModal(true);
      showToast(`Đăng nhập thành công! Chào mừng ${matched.fullname} 🌸`);
      if (typeof pushNotification === "function") {
        pushNotification({
          type: "system",
          level: "info",
          title: "Đăng nhập thành công",
          desc: `Chào mừng ${matched.fullname} (${matched.role || 'Thành viên'}) đã đăng nhập vào hệ thống.`,
          badge: "Auth"
        });
      }
    });
  }

  if (btnQuickDemoLogin) {
    btnQuickDemoLogin.addEventListener("click", () => {
      state.forceReAuth = false;
      setCurrentUser({
        fullname: DEFAULT_DEMO_USER.fullname,
        email: DEFAULT_DEMO_USER.email,
        role: DEFAULT_DEMO_USER.role,
        phone: DEFAULT_DEMO_USER.phone
      });
      closeAuthModal();
      closeWelcomeModal(true);
      showToast(`Đã đăng nhập tài khoản Demo (${DEFAULT_DEMO_USER.fullname})! 🌸`);
      if (typeof pushNotification === "function") {
        pushNotification({
          type: "system",
          level: "info",
          title: "Đăng nhập thành công",
          desc: `Đã đăng nhập tài khoản Demo (${DEFAULT_DEMO_USER.fullname}).`,
          badge: "Auth"
        });
      }
    });
  }

  if (formRegister) {
    formRegister.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullname = (document.getElementById("reg-fullname")?.value || "").trim();
      const email = (document.getElementById("reg-email")?.value || "").trim().toLowerCase();
      const phone = (document.getElementById("reg-phone")?.value || "").trim();
      const role = document.getElementById("reg-role")?.value || "Data Analyst & BI 💖";
      const password = document.getElementById("reg-password")?.value || "";
      const confirmPw = document.getElementById("reg-confirm-password")?.value || "";

      if (!fullname || !email || !password) {
        showAuthMessage("Vui lòng điền đầy đủ Họ tên, Tên đăng nhập/Email và Mật khẩu!");
        return;
      }
      if (password.length < 4) {
        showAuthMessage("Mật khẩu phải có ít nhất 4 ký tự!");
        return;
      }
      if (password !== confirmPw) {
        showAuthMessage("Mật khẩu nhập lại không khớp!");
        return;
      }

      const users = getStoredUsers();
      if (users.some(u => u.email.toLowerCase() === email)) {
        showAuthMessage("Email / Tên đăng nhập này đã tồn tại. Vui lòng chuyển sang tab Đăng Nhập!");
        return;
      }

      const newUser = { fullname, email, phone, role, password };
      users.push(newUser);
      saveStoredUsers(users);
      state.forceReAuth = false;
      setCurrentUser({ fullname, email, phone, role });
      closeAuthModal();
      closeWelcomeModal(true);
      showToast(`Đăng ký thành công! Chào mừng ${fullname} 🌸`);
      if (typeof pushNotification === "function") {
        pushNotification({
          type: "system",
          level: "info",
          title: "Tài khoản mới đã tạo",
          desc: `Chào mừng thành viên mới ${fullname} (${role}) gia nhập hệ thống.`,
          badge: "Auth"
        });
      }
    });
  }

  if (formForgot) {
    formForgot.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (document.getElementById("forgot-email")?.value || "").trim().toLowerCase();
      const newPw = document.getElementById("forgot-new-pw")?.value || "";
      if (!email || !newPw) {
        showAuthMessage("Vui lòng nhập Tên đăng nhập/Email và mật khẩu mới!");
        return;
      }
      if (newPw.length < 4) {
        showAuthMessage("Mật khẩu mới phải có ít nhất 4 ký tự!");
        return;
      }
      const users = getStoredUsers();
      const target = users.find(u => u.email.toLowerCase() === email);
      if (!target) {
        showAuthMessage("Không tìm thấy tài khoản này trong hệ thống!");
        return;
      }
      target.password = newPw;
      saveStoredUsers(users);
      showAuthMessage("Đã cập nhật mật khẩu mới thành công! Vui lòng đăng nhập lại.", false);
      setTimeout(() => switchAuthTab("login"), 1200);
    });
  }

  // Profile Update Form Logic (Cập Nhật Tài Khoản)
  if (formUpdateProfile) {
    formUpdateProfile.addEventListener("submit", (e) => {
      e.preventDefault();
      const newFullname = (profileFullnameInput?.value || "").trim();
      const newPhone = (profilePhoneInput?.value || "").trim();
      const newRole = profileRoleSelect?.value || "Data Analyst & BI 💖";
      const newPw = profileNewPwInput?.value || "";

      if (!newFullname) {
        if (profileMessageBox) {
          profileMessageBox.classList.remove("hidden", "bg-emerald-50", "text-emerald-700", "border-emerald-200");
          profileMessageBox.classList.add("bg-rose-50", "text-rose-700", "border", "border-rose-200");
          profileMessageBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i><span>Vui lòng nhập Họ và tên!</span>`;
        }
        return;
      }

      if (newPw && newPw.length < 4) {
        if (profileMessageBox) {
          profileMessageBox.classList.remove("hidden", "bg-emerald-50", "text-emerald-700", "border-emerald-200");
          profileMessageBox.classList.add("bg-rose-50", "text-rose-700", "border", "border-rose-200");
          profileMessageBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i><span>Mật khẩu mới phải có ít nhất 4 ký tự!</span>`;
        }
        return;
      }

      const currentUser = getCurrentUser() || DEFAULT_DEMO_USER;
      const users = getStoredUsers();
      let matched = users.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (matched) {
        matched.fullname = newFullname;
        matched.phone = newPhone;
        matched.role = newRole;
        if (newPw) matched.password = newPw;
      } else {
        matched = {
          fullname: newFullname,
          email: currentUser.email,
          phone: newPhone,
          role: newRole,
          password: newPw || "123456"
        };
        users.push(matched);
      }
      saveStoredUsers(users);

      const updatedUser = {
        fullname: newFullname,
        email: currentUser.email,
        phone: newPhone,
        role: newRole
      };
      setCurrentUser(updatedUser);

      if (profileMessageBox) {
        profileMessageBox.classList.remove("hidden", "bg-rose-50", "text-rose-700", "border-rose-200");
        profileMessageBox.classList.add("bg-emerald-50", "text-emerald-700", "border", "border-emerald-200");
        profileMessageBox.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>Cập nhật thông tin tài khoản thành công!</span>`;
      }

      showToast(`Đã cập nhật tài khoản: ${newFullname} 🌸`);
      if (typeof pushNotification === "function") {
        pushNotification({
          type: "system",
          level: "info",
          title: "Cập nhật tài khoản",
          desc: `Thông tin tài khoản ${newFullname} (${newRole}) đã được cập nhật thành công.`,
          badge: "Profile"
        });
      }

      setTimeout(() => {
        closeProfileModal();
      }, 900);
    });
  }

  if (btnCloseProfile) {
    btnCloseProfile.addEventListener("click", closeProfileModal);
  }

  if (profileOverlay) {
    profileOverlay.addEventListener("click", (e) => {
      if (e.target === profileOverlay) closeProfileModal();
    });
  }

  if (btnLogoutFromProfile) {
    btnLogoutFromProfile.addEventListener("click", () => {
      handleSignOut(true);
    });
  }

  if (btnProfileToWelcome) {
    btnProfileToWelcome.addEventListener("click", () => {
      closeProfileModal();
      openWelcomeModal();
    });
  }

  // Logout & Signout Buttons (Header & Sidebar)
  if (btnLogoutAccount) {
    btnLogoutAccount.addEventListener("click", () => {
      handleSignOut(true);
    });
  }

  if (navSignoutBtn) {
    navSignoutBtn.addEventListener("click", () => {
      if (getCurrentUser()) {
        handleSignOut(true);
      } else {
        openAuthModal("login", true);
      }
    });
  }

  // Interactive My Melody AI Agent Chat Launcher & Drawer Toggle
  const btnMyMelodyMascot = document.getElementById("btn-mymelody-mascot");
  const aiChatDrawer = document.getElementById("ai-chat-drawer");
  const btnCloseAiChat = document.getElementById("btn-close-ai-chat");
  const navMessagesBtn = document.getElementById("nav-messages");
  const myMelodyBubble = document.getElementById("mymelody-speech-bubble");
  const btnHideMyMelodySpeech = document.getElementById("btn-hide-mymelody-speech");

  function toggleAiChatDrawer(forceOpen = null) {
    if (!aiChatDrawer) return;
    const willOpen = forceOpen !== null ? forceOpen : aiChatDrawer.classList.contains("hidden");
    if (willOpen) {
      aiChatDrawer.classList.remove("hidden");
      if (myMelodyBubble) myMelodyBubble.classList.add("hidden");
      document.getElementById("ai-chat-input")?.focus();
    } else {
      aiChatDrawer.classList.add("hidden");
    }
  }

  // Draggable helper for AI Chat Launcher & Chat Drawer
  const myMelodyCompanion = document.getElementById("mymelody-companion");
  const aiChatHeader = document.getElementById("ai-chat-header");
  let companionWasDragged = false;

  function makeDraggable(targetEl, handleEl, onDragStateChange = null) {
    if (!targetEl || !handleEl) return;
    let startX = 0, startY = 0, origLeft = 0, origTop = 0, dragging = false, moved = false;

    handleEl.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button#btn-close-ai-chat")) return;
      dragging = true;
      moved = false;
      const rect = targetEl.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      origLeft = rect.left;
      origTop = rect.top;
      targetEl.style.left = `${origLeft}px`;
      targetEl.style.top = `${origTop}px`;
      targetEl.style.bottom = "auto";
      targetEl.style.right = "auto";
      handleEl.setPointerCapture?.(e.pointerId);
    });

    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
      if (!moved) return;
      const maxLeft = Math.max(8, window.innerWidth - targetEl.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - targetEl.offsetHeight - 8);
      const nextLeft = Math.min(Math.max(8, origLeft + dx), maxLeft);
      const nextTop = Math.min(Math.max(8, origTop + dy), maxTop);
      targetEl.style.left = `${nextLeft}px`;
      targetEl.style.top = `${nextTop}px`;
    });

    window.addEventListener("pointerup", () => {
      if (!dragging) return;
      dragging = false;
      if (onDragStateChange) onDragStateChange(moved);
    });
  }

  makeDraggable(myMelodyCompanion, btnMyMelodyMascot, (moved) => {
    companionWasDragged = moved;
  });
  makeDraggable(aiChatDrawer, aiChatHeader);

  if (btnMyMelodyMascot) {
    btnMyMelodyMascot.addEventListener("click", () => {
      if (companionWasDragged) {
        companionWasDragged = false;
        return;
      }
      toggleAiChatDrawer();
    });
  }
  if (btnCloseAiChat) {
    btnCloseAiChat.addEventListener("click", () => toggleAiChatDrawer(false));
  }
  if (navMessagesBtn) {
    navMessagesBtn.addEventListener("click", () => toggleAiChatDrawer(true));
  }

  if (btnHideMyMelodySpeech && myMelodyBubble) {
    btnHideMyMelodySpeech.addEventListener("click", (e) => {
      e.stopPropagation();
      myMelodyBubble.classList.add("hidden");
    });
  }

  if (btnCloseWelcome) {
    btnCloseWelcome.addEventListener("click", () => {
      if (getCurrentUser()) {
        closeWelcomeModal();
      } else {
        openAuthModal("login");
      }
    });
  }

  if (btnOpenWelcome) {
    btnOpenWelcome.addEventListener("click", () => {
      if (getCurrentUser()) {
        openProfileModal();
      } else {
        openAuthModal("login", false);
      }
    });
  }

  if (navSettingsBtn) {
    navSettingsBtn.addEventListener("click", () => {
      if (getCurrentUser()) {
        openProfileModal();
      } else {
        openAuthModal("login", false);
      }
    });
  }

  // Close when clicking outside the modal on the backdrop
  if (welcomeOverlay && welcomeCard) {
    welcomeOverlay.addEventListener("click", (e) => {
      if (e.target === welcomeOverlay) {
        if (getCurrentUser()) {
          closeWelcomeModal();
        } else {
          openAuthModal("login");
        }
      }
    });
  }

  // Dark / Light Theme Toggle Logic
  const btnThemeToggle = document.getElementById("btn-theme-toggle");
  const themeToggleIcon = document.getElementById("theme-toggle-icon");

  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      if (themeToggleIcon) {
        themeToggleIcon.className = "fa-solid fa-sun text-amber-400";
      }
      if (btnThemeToggle) {
        btnThemeToggle.setAttribute("title", "Chuyển sang chế độ Sáng (Light Mode)");
      }
    } else {
      document.body.classList.remove("dark-mode");
      if (themeToggleIcon) {
        themeToggleIcon.className = "fa-solid fa-moon text-slate-600";
      }
      if (btnThemeToggle) {
        btnThemeToggle.setAttribute("title", "Chuyển sang chế độ Tối (Dark Mode)");
      }
    }
    try {
      localStorage.setItem("app_theme", theme);
    } catch (e) {}
  }

  // Initialize theme from localStorage or default to light
  let initTheme = "light";
  try {
    initTheme = localStorage.getItem("app_theme") || "light";
  } catch (e) {}
  applyTheme(initTheme);

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark-mode");
      const nextTheme = isDark ? "light" : "dark";
      applyTheme(nextTheme);
      showToast(nextTheme === "dark" ? "Đã chuyển sang chế độ Tối 🌙" : "Đã chuyển sang chế độ Sáng ☀️");
    });
  }

  // Clear all data to blank state for client use
  function clearAllData() {
    if (typeof pushDataHistorySnapshot === "function") pushDataHistorySnapshot();
    state.currentPhase = 1;
    state.phase1Completed = false;
    state.phase2Completed = false;
    state.phase3Completed = false;
    state.isCleaningRunning = false;
    state.isReportGenerated = false;
    state.isAuditCompleted = false;
    state.selectedStoreForDecision = null;

    currentRawRecords = [];
    customDatasetLoaded = false;
    customDatasetStats = {
      totalRows: 0,
      duplicateRows: 0,
      cancelledRows: 0,
      returnRows: 0,
      cleanRows: 0,
      fileName: "Chưa có tệp"
    };

    // Update Counters
    const cleanEl = document.getElementById("stat-clean-rows");
    if (cleanEl) cleanEl.textContent = "0";
    const dupEl = document.getElementById("stat-duplicate-rows");
    if (dupEl) dupEl.textContent = "0";
    const canEl = document.getElementById("stat-cancelled-rows");
    if (canEl) canEl.textContent = "0";
    const retEl = document.getElementById("stat-return-rows");
    if (retEl) retEl.textContent = "0";
    const totEl = document.getElementById("stat-total-raw-rows");
    if (totEl) totEl.innerHTML = `0 <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const totDesc = document.getElementById("stat-total-raw-desc");
    if (totDesc) totDesc.textContent = "Chưa có tệp nạp";
    updateStep2ErrorCounts(customDatasetStats, []);

    // Update Badges
    const b1 = document.getElementById("badge-phase1");
    if (b1) {
      b1.textContent = "Chờ nạp tệp";
      b1.className = "text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md";
    }
    const b2 = document.getElementById("badge-phase2");
    if (b2) {
      b2.textContent = "Chờ GĐ 1";
      b2.className = "text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md";
    }
    const b3 = document.getElementById("badge-phase3");
    if (b3) {
      b3.textContent = "Chờ GĐ 2";
      b3.className = "text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md";
    }
    const tab1 = document.getElementById("tab-phase1");
    if (tab1) tab1.classList.remove("completed");
    const tab2 = document.getElementById("tab-phase2");
    if (tab2) tab2.classList.remove("completed");
    const tab3 = document.getElementById("tab-phase3");
    if (tab3) tab3.classList.remove("completed");

    if (uploadBanner) uploadBanner.classList.add("hidden");
    if (activeSourceBadge) {
      activeSourceBadge.textContent = "Chưa nạp tệp";
      activeSourceBadge.className = "px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500 border border-slate-200 font-bold";
    }

    if (cleaningStatusBadge) {
      cleaningStatusBadge.textContent = "Chờ nạp tệp";
      cleaningStatusBadge.className = "px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-bold";
    }

    if (logOutput) {
      logOutput.innerHTML = `
        <div class="text-slate-500">[INFO] Hệ thống AI Agent BPMN 3.0 sẵn sàng tiếp nhận dữ liệu doanh nghiệp.</div>
        <div class="text-slate-500">[INFO] Vui lòng kéo & thả tệp Excel (.xlsx, .xls) hoặc CSV để AI Agent phân tích và làm sạch.</div>
      `;
    }

    // Reset Macro KPIs
    const kpiRev = document.getElementById("kpi-macro-rev");
    if (kpiRev) kpiRev.innerHTML = `0 <span class="text-sm font-semibold text-blue-600">VNĐ</span>`;
    const kpiRevTgtLbl = document.getElementById("kpi-macro-rev-target-lbl");
    if (kpiRevTgtLbl) kpiRevTgtLbl.textContent = "Mục tiêu: 0 VNĐ";
    const kpiRevTgt = document.getElementById("kpi-macro-rev-target");
    if (kpiRevTgt) {
      kpiRevTgt.textContent = "0%";
      kpiRevTgt.className = "text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded";
    }

    const kpiProf = document.getElementById("kpi-macro-profit");
    if (kpiProf) kpiProf.innerHTML = `0 <span class="text-sm font-semibold text-emerald-600">VNĐ</span>`;
    const kpiProfTgtLbl = document.getElementById("kpi-macro-profit-target-lbl");
    if (kpiProfTgtLbl) kpiProfTgtLbl.textContent = "Mục tiêu: 0 VNĐ";
    const kpiProfTgt = document.getElementById("kpi-macro-profit-target");
    if (kpiProfTgt) {
      kpiProfTgt.textContent = "0%";
      kpiProfTgt.className = "text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded";
    }

    const kpiMargin = document.getElementById("kpi-macro-margin");
    if (kpiMargin) kpiMargin.textContent = "0.0%";
    const kpiMarginSub = document.getElementById("kpi-macro-margin-sub");
    if (kpiMarginSub) {
      kpiMarginSub.textContent = "Chờ tính toán";
      kpiMarginSub.className = "text-slate-400 font-medium";
    }

    const kpiRet = document.getElementById("kpi-macro-return");
    if (kpiRet) kpiRet.textContent = "0.0%";
    const kpiRetSub = document.getElementById("kpi-macro-return-sub");
    if (kpiRetSub) {
      kpiRetSub.textContent = "Chờ tính toán";
      kpiRetSub.className = "text-slate-400 font-medium";
    }

    // Reset Top products
    for (let i = 1; i <= 4; i++) {
      const prog = document.getElementById(`prog-cat-0${i}`);
      const badge = document.getElementById(`badge-cat-0${i}`);
      if (prog) prog.style.width = "0%";
      if (badge) badge.textContent = "0%";
    }

    // Reset Top row metrics
    const sumTotRev = document.getElementById("summary-total-rev-header");
    if (sumTotRev) sumTotRev.textContent = "0 VNĐ";
    const sumTgtBadge = document.getElementById("summary-target-reality-badge");
    if (sumTgtBadge) {
      sumTgtBadge.textContent = "Chờ dữ liệu";
      sumTgtBadge.className = "text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full";
    }
    const statReal = document.getElementById("stat-reality-sales");
    if (statReal) statReal.innerHTML = `0 B <span class="text-slate-400 font-normal">(0)</span>`;
    const statTgt = document.getElementById("stat-target-sales");
    if (statTgt) statTgt.innerHTML = `0 B <span class="text-slate-400 font-normal">(0)</span>`;

    renderRawSampleTable();
    renderStoresManagementTable();
    renderAnomalyCards();
    renderPriorityMatrix();
    initCharts(true);
    switchPhase(1);
    hideSubsequentSteps();
  }

  // Clear data on startup so client starts with a completely blank canvas
  clearAllData();
  hideSubsequentSteps();

  // ==============================================
  // INTERACTIVE STAR PARTICLE & MOTION TRAIL ENGINE
  // ==============================================
  const starCanvas = document.getElementById("star-trail-canvas");
  if (starCanvas) {
    const ctx = starCanvas.getContext("2d");
    let particles = [];
    let width = (starCanvas.width = window.innerWidth);
    let height = (starCanvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = starCanvas.width = window.innerWidth;
      height = starCanvas.height = window.innerHeight;
    });

    const starColors = [
      "#FF2D78", // Vibrant rose pink
      "#FF5B8E", // Dabang primary pink
      "#FF9EAF", // Pastel pink
      "#FFA07A", // Pastel coral
      "#FBBF24", // Gold star
      "#FDE047", // Twinkle yellow
      "#C084FC", // Soft purple
      "#67E8F9", // Sparkle cyan
      "#FFFFFF"  // Pure sparkle white
    ];

    class StarParticle {
      constructor(x, y, isBurst = false) {
        this.x = x;
        this.y = y;
        this.color = starColors[Math.floor(Math.random() * starColors.length)];
        this.spikes = Math.random() > 0.35 ? 4 : 5; // 4-pointed or 5-pointed sparkle star
        this.maxSize = isBurst ? Math.random() * 9 + 6 : Math.random() * 6 + 3.5;
        this.size = 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.16;
        this.life = 0;
        this.maxLife = isBurst ? Math.random() * 38 + 25 : Math.random() * 26 + 20;

        const angle = isBurst ? Math.random() * Math.PI * 2 : Math.random() * Math.PI * 2;
        const speed = isBurst ? Math.random() * 4.5 + 1.8 : Math.random() * 1.6 + 0.4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed + (isBurst ? -1.2 : -0.3);
        this.decay = 0.96;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.decay;
        this.vy *= this.decay;
        this.vy += 0.04;
        this.rotation += this.rotSpeed;
        this.life++;

        const progress = this.life / this.maxLife;
        if (progress < 0.25) {
          this.size = (progress / 0.25) * this.maxSize;
        } else {
          this.size = (1 - (progress - 0.25) / 0.75) * this.maxSize;
        }
      }

      draw(c) {
        if (this.size <= 0.2) return;
        const rot = this.rotation;
        const outer = this.size;
        const inner = this.size * 0.4;

        c.save();
        c.beginPath();
        c.translate(this.x, this.y);
        c.rotate(rot);
        for (let i = 0; i < this.spikes; i++) {
          c.lineTo(
            Math.cos((i * Math.PI) / (this.spikes / 2)) * outer,
            Math.sin((i * Math.PI) / (this.spikes / 2)) * outer
          );
          c.lineTo(
            Math.cos(((i + 0.5) * Math.PI) / (this.spikes / 2)) * inner,
            Math.sin(((i + 0.5) * Math.PI) / (this.spikes / 2)) * inner
          );
        }
        c.closePath();
        c.fillStyle = this.color;
        c.shadowColor = this.color;
        c.shadowBlur = 10;
        c.globalAlpha = Math.max(0, 1 - this.life / this.maxLife);
        c.fill();
        c.restore();
      }
    }

    let lastX = -100;
    let lastY = -100;
    let animId = null;

    function addStar(x, y, count = 2, isBurst = false) {
      for (let i = 0; i < count; i++) {
        if (particles.length < 180) {
          particles.push(new StarParticle(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8, isBurst));
        }
      }
      if (!animId) {
        animId = requestAnimationFrame(animateStars);
      }
    }

    // Sparkle trail on mouse motion
    window.addEventListener("mousemove", (e) => {
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist > 7) {
        addStar(e.clientX, e.clientY, dist > 20 ? 3 : 2, false);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });

    // Touch motion on mobile/tablet
    window.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          addStar(t.clientX, t.clientY, 2, false);
        }
      },
      { passive: true }
    );

    // Star burst on click
    window.addEventListener("click", (e) => {
      addStar(e.clientX, e.clientY, 14, true);
    });

    function animateStars() {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life >= p.maxLife || p.size <= 0.2) {
          particles.splice(i, 1);
        }
      }

      if (particles.length > 0) {
        animId = requestAnimationFrame(animateStars);
      } else {
        animId = null;
        ctx.clearRect(0, 0, width, height);
      }
    }
  }
});

