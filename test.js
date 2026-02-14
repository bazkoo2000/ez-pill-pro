<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام إدارة جرعات الصيدلية - متقدم شامل</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-color: #667eea;
            --secondary-color: #764ba2;
            --success-color: #11998e;
            --danger-color: #f5576c;
            --warning-color: #ff9800;
            --info-color: #17a2b8;
            --light-bg: #f5f7fa;
            --dark-text: #333;
            --border-radius: 12px;
            --box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: 'Segoe UI', 'Cairo', 'Arial', Tahoma, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            direction: rtl;
            text-align: right;
            color: var(--dark-text);
        }

        .main-container {
            max-width: 1600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: var(--box-shadow);
            padding: 40px;
            animation: slideInDown 0.6s ease;
        }

        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes popIn {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.7;
            }
        }

        /* رأس الصفحة */
        .page-header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 4px solid var(--primary-color);
            padding-bottom: 25px;
            animation: slideInDown 0.8s ease;
        }

        .page-header h1 {
            font-size: 3em;
            color: var(--dark-text);
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            font-weight: 800;
        }

        .page-header .subtitle {
            color: #666;
            font-size: 1.2em;
            font-weight: 500;
            margin-bottom: 15px;
        }

        .page-header .app-info {
            color: var(--primary-color);
            font-size: 0.95em;
            font-weight: 600;
        }

        /* معلومات التاريخ والوقت */
        .date-time-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 25px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: var(--border-radius);
            border: 2px solid var(--primary-color);
            animation: slideInUp 0.8s ease;
        }

        .date-time-box {
            background: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }

        .date-time-box:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }

        .date-time-box label {
            display: block;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 8px;
            font-size: 0.95em;
        }

        .date-time-box span {
            display: block;
            font-size: 1.1em;
            color: var(--dark-text);
            font-weight: 600;
        }

        /* أزرار وعناصر التحكم */
        .controls-section {
            background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
            padding: 25px;
            border-radius: var(--border-radius);
            margin: 25px 0;
            border: 2px solid var(--primary-color);
            animation: slideInUp 0.8s ease 0.1s both;
        }

        .controls-section h3 {
            color: var(--primary-color);
            margin-bottom: 15px;
            font-size: 1.2em;
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 10px;
        }

        .button-group {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
        }

        button, input[type="button"], input[type="submit"] {
            padding: 12px 28px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            font-size: 1em;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            position: relative;
            overflow: hidden;
            text-transform: none;
            font-family: 'Cairo', 'Segoe UI', sans-serif;
        }

        button:hover, input[type="button"]:hover, input[type="submit"]:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        button:active, input[type="button"]:active, input[type="submit"]:active {
            transform: translateY(-1px);
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }

        .btn-secondary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-size: 0.9em;
            padding: 10px 20px;
        }

        .btn-success {
            background: linear-gradient(135deg, #11998e, #38ef7d);
            color: white;
        }

        .btn-success:hover {
            background: linear-gradient(135deg, #0f8570, #2acc6a);
        }

        .btn-warning {
            background: linear-gradient(135deg, #f093fb, #f5576c);
            color: white;
        }

        .btn-warning:hover {
            background: linear-gradient(135deg, #d87ae8, #e6415b);
        }

        .btn-danger {
            background: linear-gradient(135deg, #fa709a, #fee140);
            color: #333;
            font-weight: 800;
        }

        .btn-danger:hover {
            background: linear-gradient(135deg, #f55878, #ffd924);
        }

        .btn-info {
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            color: white;
        }

        .btn-info:hover {
            background: linear-gradient(135deg, #3d95d4, #00d4e1);
        }

        /* السويتشات */
        .mode-switches {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            margin: 20px 0;
        }

        .switch-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .switch-label {
            font-weight: bold;
            color: var(--dark-text);
            font-size: 1em;
        }

        .switch-btn {
            position: relative;
            width: 140px;
            height: 45px;
            background: #e0e0e0;
            border-radius: 25px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 8px;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            font-weight: bold;
            font-size: 0.85em;
            border: 2px solid transparent;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .switch-btn.active {
            background: linear-gradient(135deg, #11998e, #38ef7d);
            color: white;
            box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);
            border-color: #0f8570;
        }

        .switch-btn.inactive {
            background: #e0e0e0;
            color: #666;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .switch-indicator {
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            transition: all 0.3s ease;
        }

        .switch-btn.active .switch-indicator {
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        /* الديالوجات */
        dialog {
            border: none;
            border-radius: 18px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            padding: 35px;
            max-width: 650px;
            animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-family: 'Cairo', 'Segoe UI', sans-serif;
        }

        dialog::backdrop {
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(5px);
        }

        dialog h2 {
            color: var(--primary-color);
            margin-bottom: 20px;
            border-bottom: 3px solid var(--primary-color);
            padding-bottom: 15px;
            font-size: 1.8em;
            font-weight: 800;
        }

        dialog h3 {
            color: #555;
            margin: 20px 0 15px 0;
            font-size: 1.3em;
            font-weight: 700;
            border-right: 4px solid var(--primary-color);
            padding-right: 12px;
        }

        dialog label {
            display: flex;
            align-items: center;
            margin: 12px 0;
            font-size: 1.05em;
            color: #555;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        dialog label:hover {
            color: var(--primary-color);
        }

        dialog input[type="checkbox"],
        dialog input[type="radio"] {
            margin-left: 12px;
            width: 20px;
            height: 20px;
            cursor: pointer;
            accent-color: var(--primary-color);
        }

        dialog input[type="text"],
        dialog input[type="time"],
        dialog input[type="number"],
        dialog select {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-family: 'Cairo', 'Segoe UI', sans-serif;
            font-size: 1em;
            transition: all 0.3s ease;
        }

        dialog input[type="text"]:focus,
        dialog input[type="time"]:focus,
        dialog input[type="number"]:focus,
        dialog select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 15px rgba(102, 126, 234, 0.3);
            background: #f9f9f9;
        }

        dialog .divider {
            border-top: 2px dashed var(--primary-color);
            margin: 25px 0;
        }

        dialog .button-group {
            margin-top: 25px;
            justify-content: flex-end;
        }

        /* منطقة الإدخال */
        .input-section {
            background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
            padding: 30px;
            border-radius: var(--border-radius);
            margin: 30px 0;
            border: 3px solid var(--primary-color);
            animation: slideInUp 0.8s ease 0.2s both;
        }

        .input-section label {
            display: block;
            font-weight: 800;
            color: var(--dark-text);
            margin-bottom: 15px;
            font-size: 1.2em;
        }

        textarea {
            width: 100%;
            padding: 18px;
            border: 2px solid var(--primary-color);
            border-radius: 10px;
            font-family: 'Cairo', 'Segoe UI', monospace;
            font-size: 1.05em;
            resize: vertical;
            min-height: 150px;
            transition: all 0.3s ease;
            direction: rtl;
            text-align: right;
        }

        textarea:focus {
            outline: none;
            border-color: var(--secondary-color);
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.4);
            background: white;
        }

        textarea::placeholder {
            color: #999;
            font-size: 0.95em;
        }

        /* منطقة الجداول */
        .table-section {
            margin: 35px 0;
            animation: slideInUp 0.8s ease 0.3s both;
        }

        .table-section h2 {
            color: var(--dark-text);
            font-size: 1.5em;
            margin: 30px 0 20px 0;
            border-bottom: 4px solid var(--primary-color);
            padding-bottom: 12px;
            font-weight: 800;
        }

        .table-container {
            overflow-x: auto;
            border-radius: var(--border-radius);
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            margin: 20px 0;
            border: 1px solid #e0e0e0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            font-size: 0.98em;
        }

        thead {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-weight: 900;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        th {
            padding: 18px;
            text-align: center;
            font-size: 1.05em;
            border: 1px solid #e0e0e0;
            white-space: nowrap;
            letter-spacing: 0.5px;
        }

        td {
            padding: 15px;
            border: 1px solid #e0e0e0;
            text-align: center;
            transition: all 0.3s ease;
        }

        tbody tr {
            transition: all 0.2s ease;
            background: white;
        }

        tbody tr:hover {
            background: linear-gradient(90deg, #f0f4ff, #fff);
            transform: scale(1.01);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        tbody tr:nth-child(even) {
            background: #fafafa;
        }

        tbody tr:nth-child(even):hover {
            background: linear-gradient(90deg, #f5f8ff, #fff);
        }

        /* حالات صفوف الجدول */
        .row-normal {
            background: linear-gradient(90deg, #e8f5e9, #fff);
            border-right: 5px solid #4caf50;
        }

        .row-duplicate {
            background: linear-gradient(90deg, #ffebee, #fff3e0);
            border-right: 5px solid #f5576c;
        }

        .row-single-dose {
            background: linear-gradient(90deg, #e8f5e9, #f1f8e9);
            border-right: 5px solid #11998e;
        }

        .row-warning {
            background: linear-gradient(90deg, #fff3e0, #ffe0b2);
            border-right: 5px solid #ff9800;
        }

        .row-error {
            background: linear-gradient(90deg, #ffebee, #ffcdd2);
            border-right: 5px solid #f44336;
        }

        /* أزرار الجدول */
        .action-buttons {
            display: flex;
            gap: 8px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .action-btn {
            padding: 10px 14px;
            font-size: 0.9em;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            min-width: 35px;
        }

        .btn-edit {
            background: #2196F3;
            color: white;
        }

        .btn-edit:hover {
            background: #1976D2;
            transform: scale(1.1);
        }

        .btn-delete {
            background: #f44336;
            color: white;
        }

        .btn-delete:hover {
            background: #da190b;
            transform: scale(1.1);
        }

        .btn-duplicate {
            background: #ff9800;
            color: white;
        }

        .btn-duplicate:hover {
            background: #e68900;
            transform: scale(1.1);
        }

        /* الشارات والعلامات */
        .badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 700;
            margin: 3px;
            white-space: nowrap;
            letter-spacing: 0.3px;
        }

        .badge-normal {
            background: linear-gradient(135deg, #4caf50, #45a049);
            color: white;
        }

        .badge-duplicate {
            background: linear-gradient(135deg, #f5576c, #f2405a);
            color: white;
        }

        .badge-single {
            background: linear-gradient(135deg, #11998e, #0f8570);
            color: white;
        }

        .badge-warning {
            background: linear-gradient(135deg, #ff9800, #e68900);
            color: white;
        }

        .badge-medicine {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }

        /* التنبيهات والرسائل */
        .alerts-container {
            margin: 20px 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
            animation: slideInUp 0.5s ease;
        }

        .alert {
            padding: 18px;
            border-radius: 10px;
            border-right: 5px solid;
            font-weight: 600;
            animation: slideInLeft 0.5s ease;
            display: flex;
            gap: 12px;
            align-items: flex-start;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .alert-icon {
            font-size: 1.3em;
            min-width: 24px;
        }

        .alert-content {
            flex: 1;
            line-height: 1.6;
        }

        .alert-success {
            background: #d4edda;
            border-color: #28a745;
            color: #155724;
        }

        .alert-warning {
            background: #fff3cd;
            border-color: #ffc107;
            color: #856404;
        }

        .alert-danger {
            background: #f8d7da;
            border-color: #f5576c;
            color: #721c24;
        }

        .alert-info {
            background: #d1ecf1;
            border-color: #17a2b8;
            color: #0c5460;
        }

        .alert-close {
            cursor: pointer;
            font-size: 1.2em;
            color: inherit;
            opacity: 0.7;
            transition: opacity 0.2s ease;
        }

        .alert-close:hover {
            opacity: 1;
        }

        /* نموذج التعديل المضمن */
        .inline-edit-form {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 35px;
            border-radius: 18px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            z-index: 2000;
            min-width: 450px;
            animation: popIn 0.4s ease;
            border: 3px solid var(--primary-color);
        }

        .inline-edit-form.active {
            display: block;
        }

        .inline-edit-form h3 {
            color: var(--primary-color);
            margin-bottom: 20px;
            font-size: 1.5em;
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 10px;
        }

        .form-group {
            margin-bottom: 18px;
        }

        .form-group label {
            display: block;
            font-weight: 700;
            color: var(--dark-text);
            margin-bottom: 8px;
            font-size: 0.95em;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-family: 'Cairo', 'Segoe UI', sans-serif;
            font-size: 1em;
            transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 15px rgba(102, 126, 234, 0.3);
        }

        .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }

        .inline-edit-form .button-group {
            margin-top: 25px;
            gap: 10px;
        }

        /* شريط الحالة */
        .status-bar {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 25px;
            border-radius: var(--border-radius);
            margin: 30px 0;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            font-weight: bold;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            animation: slideInUp 0.8s ease 0.4s both;
        }

        .status-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            transition: all 0.3s ease;
        }

        .status-item:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-3px);
        }

        .status-number {
            font-size: 2.2em;
            margin-bottom: 8px;
            font-weight: 900;
            letter-spacing: 1px;
        }

        .status-label {
            font-size: 0.95em;
            opacity: 0.95;
        }

        /* مربعات الفلترة والبحث */
        .search-filter-box {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 25px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
            border-radius: var(--border-radius);
            border: 2px solid var(--primary-color);
            animation: slideInUp 0.8s ease 0.3s both;
        }

        .search-filter-box input,
        .search-filter-box select {
            padding: 14px;
            border: 2px solid var(--primary-color);
            border-radius: 8px;
            font-size: 1em;
            font-family: 'Cairo', 'Segoe UI', sans-serif;
            transition: all 0.3s ease;
        }

        .search-filter-box input:focus,
        .search-filter-box select:focus {
            outline: none;
            border-color: var(--secondary-color);
            box-shadow: 0 0 15px rgba(102, 126, 234, 0.3);
            background: white;
        }

        /* الإحصائيات */
        .statistics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin: 30px 0;
            animation: slideInUp 0.8s ease 0.4s both;
        }

        .stat-box {
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            color: white;
            font-weight: bold;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            min-height: 150px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .stat-box:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }

        .stat-number {
            font-size: 2.8em;
            margin-bottom: 10px;
            font-weight: 900;
            letter-spacing: 1px;
        }

        .stat-label {
            font-size: 1.1em;
            opacity: 0.95;
        }

        .stat-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .stat-success {
            background: linear-gradient(135deg, #11998e, #38ef7d);
        }

        .stat-warning {
            background: linear-gradient(135deg, #ff9800, #ffb74d);
        }

        .stat-danger {
            background: linear-gradient(135deg, #f5576c, #fa709a);
        }

        /* جدول الدبليكيت */
        .duplicates-section {
            display: none;
            margin-top: 35px;
            padding: 25px;
            background: linear-gradient(135deg, #fff3e0, #ffe0b2);
            border-radius: var(--border-radius);
            border-right: 6px solid #ff9800;
            animation: slideInUp 0.6s ease;
        }

        .duplicates-section.show {
            display: block;
        }

        .duplicates-section h3 {
            color: #e65100;
            margin-bottom: 20px;
            font-size: 1.3em;
            font-weight: 800;
        }

        /* شريط الأدوات العائم */
        .floating-toolbar {
            position: fixed;
            bottom: 40px;
            left: 40px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 500;
            animation: slideInLeft 0.8s ease;
        }

        .floating-btn {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8em;
            box-shadow: 0 6px 24px rgba(0,0,0,0.3);
            cursor: pointer;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            transition: all 0.3s ease;
            font-weight: 600;
        }

        .floating-btn:hover {
            transform: scale(1.15);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        .floating-btn:active {
            transform: scale(0.95);
        }

        /* رسالة فارغة */
        .empty-message {
            text-align: center;
            padding: 60px 20px;
            color: #999;
            font-size: 1.2em;
            font-weight: 500;
        }

        .empty-icon {
            font-size: 4em;
            margin-bottom: 20px;
            opacity: 0.5;
        }

        /* الخطوط الفاصلة */
        .divider {
            border-top: 2px dashed var(--primary-color);
            margin: 30px 0;
            opacity: 0.6;
        }

        /* الشبكات */
        .grid-2 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin: 25px 0;
        }

        .grid-3 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 25px 0;
        }

        .grid-4 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 25px 0;
        }

        /* العناصر المخفية */
        .hidden {
            display: none !important;
        }

        /* المحاذاة */
        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        /* المسافات */
        .mt-1 { margin-top: 10px; }
        .mt-2 { margin-top: 20px; }
        .mt-3 { margin-top: 30px; }
        .mb-1 { margin-bottom: 10px; }
        .mb-2 { margin-bottom: 20px; }
        .mb-3 { margin-bottom: 30px; }
        .p-1 { padding: 10px; }
        .p-2 { padding: 20px; }
        .p-3 { padding: 30px; }

        /* الكثافة */
        .font-bold {
            font-weight: 700;
        }

        .font-regular {
            font-weight: 400;
        }

        .font-light {
            font-weight: 300;
        }

        .text-large {
            font-size: 1.2em;
        }

        .text-small {
            font-size: 0.85em;
        }

        /* Responsive */
        @media (max-width: 1200px) {
            .main-container {
                padding: 30px;
            }

            .page-header h1 {
                font-size: 2.2em;
            }

            .statistics-grid,
            .grid-3,
            .date-time-info {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            }
        }

        @media (max-width: 768px) {
            .main-container {
                padding: 20px;
                border-radius: 15px;
            }

            .page-header h1 {
                font-size: 1.8em;
            }

            .page-header .subtitle {
                font-size: 1em;
            }

            .button-group {
                flex-direction: column;
                gap: 10px;
            }

            button {
                width: 100%;
                padding: 15px 20px;
            }

            .switch-btn {
                width: 120px;
                height: 40px;
                font-size: 0.75em;
            }

            .table-container {
                font-size: 0.85em;
            }

            th, td {
                padding: 10px 5px;
            }

            .action-btn {
                padding: 8px 10px;
                font-size: 0.85em;
            }

            .status-bar {
                grid-template-columns: repeat(2, 1fr);
                padding: 20px;
                gap: 15px;
            }

            .status-number {
                font-size: 1.8em;
            }

            .statistics-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .inline-edit-form {
                min-width: calc(100vw - 40px);
                max-width: calc(100vw - 40px);
                max-height: 90vh;
                overflow-y: auto;
            }

            dialog {
                max-width: calc(100vw - 30px);
                padding: 25px;
                margin: auto;
            }

            .floating-toolbar {
                bottom: 20px;
                left: 20px;
                gap: 10px;
            }

            .floating-btn {
                width: 60px;
                height: 60px;
                font-size: 1.5em;
            }

            textarea {
                min-height: 120px;
            }

            .search-filter-box {
                grid-template-columns: 1fr;
                gap: 10px;
            }

            .date-time-info {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 480px) {
            body {
                padding: 10px;
            }

            .main-container {
                padding: 15px;
            }

            .page-header {
                margin-bottom: 20px;
            }

            .page-header h1 {
                font-size: 1.5em;
            }

            button {
                padding: 12px 16px;
                font-size: 0.9em;
            }

            .badge {
                padding: 4px 10px;
                font-size: 0.75em;
            }

            .stat-number {
                font-size: 2em;
            }

            .status-bar {
                grid-template-columns: 1fr;
            }

            table {
                font-size: 0.8em;
            }

            th {
                padding: 8px 4px;
                font-size: 0.85em;
            }

            td {
                padding: 8px 4px;
            }

            .modal-content {
                padding: 20px;
            }
        }

        /* الطباعة */
        @media print {
            body {
                background: white;
                padding: 0;
            }

            .main-container {
                box-shadow: none;
                padding: 0;
            }

            .floating-toolbar,
            .button-group,
            .search-filter-box,
            .inline-edit-form {
                display: none !important;
            }

            table {
                page-break-inside: avoid;
            }

            thead {
                display: table-header-group;
            }

            tr {
                page-break-inside: avoid;
            }
        }

        /* التحميل والانتظار */
        .loading {
            animation: pulse 1.5s ease-in-out infinite;
        }

        /* الأخطاء */
        .error-text {
            color: #f44336;
            font-weight: 700;
            font-size: 0.9em;
        }

        .success-text {
            color: #4caf50;
            font-weight: 700;
            font-size: 0.9em;
        }

        /* التمرير السلس */
        * {
            scrollbar-width: thin;
            scrollbar-color: var(--primary-color) #f1f1f1;
        }

        *::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }

        *::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        *::-webkit-scrollbar-thumb {
            background: var(--primary-color);
            border-radius: 5px;
        }

        *::-webkit-scrollbar-thumb:hover {
            background: var(--secondary-color);
        }
    </style>
</head>
<body>
    <div class="main-container">
        <!-- رأس الصفحة -->
        <div class="page-header">
            <h1>🏥 نظام إدارة جرعات الصيدلية المتقدم</h1>
            <p class="subtitle">إدارة متطورة وآلية للأدوية والجرعات الطبية</p>
            <p class="app-info">الإصدار 3.0 - نسخة شاملة مع وضع رمضان المتقدم</p>
        </div>

        <!-- معلومات التاريخ والوقت -->
        <div class="date-time-info">
            <div class="date-time-box">
                <label>📅 التاريخ الميلادي</label>
                <span id="gregorianDate">--</span>
            </div>
            <div class="date-time-box">
                <label>☪️ التاريخ الهجري</label>
                <span id="hijriDate">--</span>
            </div>
            <div class="date-time-box">
                <label>🕐 الوقت الحالي</label>
                <span id="currentTime">--</span>
            </div>
            <div class="date-time-box">
                <label>📍 حالة النظام</label>
                <span id="systemStatus" style="color: #4caf50;">✓ نشط</span>
            </div>
        </div>

        <!-- قسم التحكم الرئيسي -->
        <div class="controls-section">
            <h3>⚙️ خيارات التحكم والإعدادات</h3>

            <!-- السويتشات -->
            <div class="mode-switches">
                <div class="switch-container">
                    <label class="switch-label">الوضع العادي</label>
                    <div class="switch-btn inactive" id="normalModeSwitch" onclick="toggleNormalMode()" title="انقر للتبديل لجرعات عادية">
                        <span>عادي</span>
                        <span class="switch-indicator"></span>
                    </div>
                </div>

                <div class="switch-container">
                    <label class="switch-label">وضع رمضان 🌙</label>
                    <div class="switch-btn inactive" id="ramadanModeSwitch" onclick="toggleRamadanMode()" title="انقر للتبديل لجرعات رمضان">
                        <span>رمضان</span>
                        <span class="switch-indicator"></span>
                    </div>
                </div>
            </div>

            <!-- أزرار التحكم الرئيسية -->
            <div class="divider"></div>
            <h3>الأدوات والعمليات</h3>
            <div class="button-group">
                <button class="btn-primary" onclick="openMainDialog()">⚙️ الإعدادات المتقدمة</button>
                <button class="btn-info" onclick="showHelp()">ℹ️ دليل الاستخدام</button>
                <button class="btn-success" onclick="openRamadanSettings()">🌙 إعدادات رمضان</button>
                <button class="btn-warning" onclick="showTemplates()">📋 قوالب الطلبات</button>
                <button class="btn-danger" onclick="clearAllData()">🗑️ مسح البيانات</button>
            </div>
        </div>

        <!-- شريط الحالة -->
        <div class="status-bar">
            <div class="status-item">
                <span class="status-number" id="totalItems">0</span>
                <span class="status-label">إجمالي الأدوية</span>
            </div>
            <div class="status-item">
                <span class="status-number" id="duplicateCount">0</span>
                <span class="status-label">جرعات مكررة</span>
            </div>
            <div class="status-item">
                <span class="status-number" id="singleDoseCount">0</span>
                <span class="status-label">جرعات فردية</span>
            </div>
            <div class="status-item">
                <span class="status-number" id="warningCount">0</span>
                <span class="status-label">تنبيهات الأخطاء</span>
            </div>
            <div class="status-item">
                <span class="status-number" id="currentMode" style="color: #ffd700;">عادي</span>
                <span class="status-label">الوضع الحالي</span>
            </div>
        </div>

        <!-- ================= الديالوجات ================= -->

        <!-- الديالوج الرئيسي - الإعدادات -->
        <dialog id="mainDialog">
            <h2>⚙️ الإعدادات المتقدمة</h2>

            <h3>🔄 أنماط العمل</h3>
            <label>
                <input type="radio" name="mode" value="normal" checked onchange="setMode('normal')">
                الوضع العادي (جرعات منتظمة طول السنة)
            </label>
            <label>
                <input type="radio" name="mode" value="ramadan" onchange="setMode('ramadan')">
                وضع رمضان (أوقات خاصة وجرعات مكررة)
            </label>

            <h3>🕐 أوقات الإفطار والسحور</h3>
            <label>
                وقت الإفطار:
                <input type="time" id="breakfastTime" value="19:00">
            </label>
            <label>
                وقت السحور:
                <input type="time" id="suhoorTime" value="03:00">
            </label>
            <label>
                وقت ما قبل الإفطار (تقريباً):
                <input type="time" id="preBreakfastTime" value="18:30">
            </label>
            <label>
                وقت ما بعد السحور:
                <input type="time" id="postSuhoorTime" value="04:00">
            </label>

            <h3>⚠️ خيارات التنبيهات</h3>
            <label>
                <input type="checkbox" id="warningDuplicate" checked>
                تنبيه من الجرعات المكررة المشبوهة
            </label>
            <label>
                <input type="checkbox" id="warningUnknown" checked>
                تنبيه من البيانات غير المفهومة أو الناقصة
            </label>
            <label>
                <input type="checkbox" id="warningSingleDose" checked>
                تنبيه من الجرعات الفردية (injection/شراب/مرهم/كريم)
            </label>
            <label>
                <input type="checkbox" id="warningSpecialTypes" checked>
                تنبيه من الأنواع الخاصة (إبر، قطرات، إلخ)
            </label>

            <h3>💾 النسخ الاحتياطي والاستيراد</h3>
            <label>
                <input type="checkbox" id="autoBackup" checked>
                عمل نسخة احتياطية تلقائية
            </label>
            <label>
                <input type="checkbox" id="showNotifications" checked>
                عرض تنبيهات المتصفح
            </label>

            <div class="button-group mt-2">
                <button class="btn-success" onclick="exportData()">📥 تصدير البيانات (JSON)</button>
                <button class="btn-success" onclick="exportToCSV()">📥 تصدير إلى CSV</button>
                <button class="btn-info" onclick="importData()">📤 استيراد البيانات</button>
                <button class="btn-warning" onclick="printTable()">🖨️ طباعة</button>
            </div>

            <div class="divider"></div>

            <h3>🔐 خيارات متقدمة</h3>
            <label>
                <input type="checkbox" id="strictMode" checked>
                الوضع الصارم (فحص دقيق للبيانات)
            </label>
            <label>
                <input type="checkbox" id="developMode">
                وضع المطورين (معلومات تفصيلية)
            </label>

            <div class="button-group mt-3">
                <button class="btn-primary" onclick="closeMainDialog()">✓ إغلاق</button>
                <button class="btn-danger" onclick="resetSettings()">↻ إعادة تعيين</button>
            </div>
        </dialog>

        <!-- الديالوج الثاني - الدبليكيت -->
        <dialog id="duplicateDialog">
            <h2>⚠️ اكتشاف جرعات مكررة (Duplicate)</h2>

            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p><strong>📌 الصنف:</strong> <span id="dupItemName" class="font-bold"></span></p>
                <p><strong>💊 الجرعة:</strong> <span id="dupDose"></span></p>
                <p><strong>🔄 التكرار:</strong> <span id="dupEvery"></span></p>
                <p><strong>🕐 وقت البدء:</strong> <span id="dupStartTime"></span></p>
                <p><strong>📅 اليوم المقترح:</strong> <span id="dupSuggestedDay"></span></p>
            </div>

            <h3>الخيارات المتاحة:</h3>

            <label>
                <input type="checkbox" id="cancelSplitCheckbox">
                ✓ إلغاء التقسيم والجرعات المكررة
            </label>

            <label>
                <input type="checkbox" id="nextMonthCheckbox">
                ✓ تفعيل الشهر التالي تلقائياً عند اكتشاف duplicate
            </label>

            <label>
                <input type="checkbox" id="applyToAllDuplicates">
                ✓ تطبيق الاختيار على جميع الدبليكيتس الأخرى
            </label>

            <h3>طريقة المعالجة:</h3>
            <label>
                <input type="radio" name="dupType" value="month" checked>
                معالجة شهرية (إضافة للشهر الحالي والشهر التالي)
            </label>
            <label>
                <input type="radio" name="dupType" value="week">
                معالجة أسبوعية (إضافة للأسبوع الحالي والتالي)
            </label>
            <label>
                <input type="radio" name="dupType" value="daily">
                معالجة يومية (في نفس اليوم)
            </label>
            <label>
                <input type="radio" name="dupType" value="custom">
                معالجة مخصصة
            </label>

            <h3>ملاحظات إضافية:</h3>
            <textarea id="duplicateNotes" placeholder="أضف ملاحظات إذا لزم الأمر..."></textarea>

            <div class="button-group mt-3">
                <button class="btn-warning" onclick="confirmDuplicate()">✓ تأكيد المعالجة</button>
                <button class="btn-primary" onclick="postponeDuplicate()">⏸️ تأجيل القرار</button>
                <button class="btn-danger" onclick="ignoreDuplicate()">✗ تجاهل التحذير</button>
            </div>
        </dialog>

        <!-- الديالوج الثالث - التحذيرات -->
        <dialog id="warningDialog">
            <h2>⚡ تنبيه - بيانات غير واضحة أو ناقصة</h2>

            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p><strong>📌 الصنف:</strong> <span id="warningItemName" class="font-bold"></span></p>
                <p><strong>💊 الجرعة المكتوبة:</strong> <span id="warningDoseText"></span></p>
                <p><strong>🔄 التكرار:</strong> <span id="warningEveryText"></span></p>
                <p><strong>🕐 وقت البدء:</strong> <span id="warningStartTimeText"></span></p>
                <p><strong>📝 الملاحظات:</strong> <span id="warningNotesText"></span></p>
            </div>

            <h3>تصحيح البيانات:</h3>

            <div class="form-group">
                <label>اسم الصنف (تصحيح):</label>
                <input type="text" id="warningEditName" placeholder="أدخل الاسم الصحيح">
            </div>

            <div class="form-group">
                <label>الجرعة (تصحيح):</label>
                <input type="text" id="warningEditDose" placeholder="مثال: قرص واحد، حقنة 10 وحدات">
            </div>

            <div class="form-group">
                <label>التكرار (تصحيح):</label>
                <input type="text" id="warningEditEvery" placeholder="مثال: يومياً، كل 6 ساعات">
            </div>

            <div class="form-group">
                <label>وقت البدء (تصحيح):</label>
                <input type="time" id="warningEditStartTime">
            </div>

            <div class="form-group">
                <label>ملاحظات إضافية:</label>
                <textarea id="warningEditNotes" placeholder="أضف ملاحظات خاصة..."></textarea>
            </div>

            <div class="button-group mt-3">
                <button class="btn-success" onclick="applyWarningFix()">💾 حفظ التصحيح</button>
                <button class="btn-primary" onclick="acceptAsIs()">✓ قبول كما هو</button>
                <button class="btn-danger" onclick="removeWarningItem()">🗑️ حذف العنصر</button>
                <button class="btn-secondary" onclick="closeWarningDialog()">إلغاء</button>
            </div>
        </dialog>

        <!-- الديالوج الرابع - المساعدة والدليل -->
        <dialog id="helpDialog">
            <h2>ℹ️ دليل الاستخدام الشامل</h2>

            <h3>🎯 ما هي وظيفة هذا النظام؟</h3>
            <p>نظام متطور لإدارة جرعات الأدوية، مع قدرات متخصصة لشهر رمضان ومعالجة الجرعات المكررة والتنبيهات الذكية.</p>

            <h3>📖 الأوضاع المتاحة:</h3>
            <p><strong>1. الوضع العادي:</strong></p>
            <p>استخدم هذا الوضع للجرعات المنتظمة طوال السنة. النظام يعالج الأوقات القياسية مثل الصباح والمساء.</p>
            <p><em>مثال: ابدأوكس 1 قرص كل يوم بعد الإفطار</em></p>

            <p><strong>2. وضع رمضان:</strong></p>
            <p>وضع متخصص لجرعات رمضان مع أوقات خاصة وتعامل متقدم مع الدبليكيتس.</p>
            <p><em>مثال: إنسولين 10 وحدات قبل الفطار، شراب الربو كل 4 ساعات بعد السحور</em></p>

            <h3>🕐 الأوقات الخاصة برمضان:</h3>
            <ul style="margin: 10px 0; padding-right: 20px;">
                <li>⏰ <strong>قبل الفطار:</strong> 18:30</li>
                <li>⏰ <strong>بعد الفطار:</strong> 19:00</li>
                <li>⏰ <strong>قبل السحور:</strong> 03:00</li>
                <li>⏰ <strong>بعد السحور:</strong> 04:00</li>
            </ul>

            <h3>💊 أنواع الجرعات المدعومة:</h3>
            <ul style="margin: 10px 0; padding-right: 20px;">
                <li>💊 أقراص وحبوب</li>
                <li>💉 حقن وإبر (injection)</li>
                <li>🥤 أشربة ومحاليل</li>
                <li>💄 مراهم وكريمات</li>
                <li>👁️ قطرات عينية وأنفية</li>
            </ul>

            <h3>🔍 الميزات الذكية:</h3>
            <ul style="margin: 10px 0; padding-right: 20px;">
                <li>✓ كشف تلقائي للجرعات المكررة</li>
                <li>✓ تنبيهات للبيانات الناقصة</li>
                <li>✓ معالجة خاصة للجرعات الفردية</li>
                <li>✓ تصحيح تلقائي للأوقات</li>
                <li>✓ معالجة Auto-match لكلمات الصيدلي</li>
            </ul>

            <h3>📝 صيغ الإدخال المدعومة:</h3>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0;">
                <p>ابدأوكس 1 قرص يومياً</p>
                <p>إنسولين 10 وحدات قبل السحور</p>
                <p>دواء الربو كل 6 ساعات</p>
                <p>مرهم جلدي يومي قبل النوم</p>
                <p>قطرات العين مرتين يومياً</p>
            </div>

            <h3>⚠️ الرسائل والتنبيهات:</h3>
            <p>النظام يعطيك تنبيهات واضحة في الحالات التالية:</p>
            <ul style="margin: 10px 0; padding-right: 20px;">
                <li>🔴 جرعات مكررة (نفس الدواء في وقتين)</li>
                <li>🟠 بيانات ناقصة أو غير واضحة</li>
                <li>🟡 أنواع خاصة (injection/مرهم) في جرعة واحدة</li>
                <li>🔵 معلومات إضافية مهمة</li>
            </ul>

            <div class="divider"></div>
            <button class="btn-primary" onclick="closeHelpDialog()">✓ حسناً، فهمت</button>
        </dialog>

        <!-- الديالوج الخامس - إعدادات رمضان -->
        <dialog id="ramadanSettingsDialog">
            <h2>🌙 إعدادات وضع رمضان</h2>

            <h3>⏰ الأوقات الخاصة برمضان</h3>

            <div class="form-group">
                <label>⏰ وقت الإفطار (بعد الأذان):</label>
                <input type="time" id="ramadanBreakfastTime" value="19:00">
            </div>

            <div class="form-group">
                <label>⏰ وقت قبل الإفطار (تحضيرات):</label>
                <input type="time" id="ramadanPreBreakfastTime" value="18:30">
            </div>

            <div class="form-group">
                <label>⏰ وقت السحور (قبل الأذان):</label>
                <input type="time" id="ramadanSuhoorTime" value="03:00">
            </div>

            <div class="form-group">
                <label>⏰ وقت بعد السحور:</label>
                <input type="time" id="ramadanPostSuhoorTime" value="04:00">
            </div>

            <h3>⚙️ خيارات المعالجة</h3>

            <label>
                <input type="checkbox" id="autoDetectRamadanWords" checked>
                اكتشاف تلقائي لكلمات رمضان (عشاء، سحور، إلخ)
            </label>

            <label>
                <input type="checkbox" id="autoMarkDuplicates" checked>
                وضع علامة تلقائية على الجرعات المكررة
            </label>

            <label>
                <input type="checkbox" id="autoAdjustNextDay" checked>
                تعديل تلقائي لليوم التالي بعد منتصف الليل
            </label>

            <label>
                <input type="checkbox" id="warnSingleDoseRamadan" checked>
                تنبيه من الجرعات الفردية في رمضان
            </label>

            <h3>📅 معلومات تقويم رمضان</h3>

            <div class="form-group">
                <label>شهر رمضان:</label>
                <input type="text" id="ramadanMonth" value="رمضان 1446 هـ" readonly>
            </div>

            <div class="form-group">
                <label>عدد أيام رمضان:</label>
                <input type="number" id="ramadanDays" value="30" min="29" max="30">
            </div>

            <h3>🎯 استراتيجية المعالجة</h3>

            <label>
                <input type="radio" name="ramadanStrategy" value="automatic" checked>
                معالجة تلقائية (النظام يقرر)
            </label>

            <label>
                <input type="radio" name="ramadanStrategy" value="manual">
                معالجة يدوية (أنت تقرر لكل حالة)
            </label>

            <label>
                <input type="radio" name="ramadanStrategy" value="relaxed">
                معالجة متساهلة (تنبيهات أقل)
            </label>

            <div class="button-group mt-3">
                <button class="btn-success" onclick="applyRamadanSettings()">💾 حفظ الإعدادات</button>
                <button class="btn-primary" onclick="resetRamadanSettings()">↻ إعادة تعيين</button>
                <button class="btn-secondary" onclick="closeRamadanSettings()">إغلاق</button>
            </div>
        </dialog>

        <!-- الديالوج السادس - القوالب -->
        <dialog id="templatesDialog">
            <h2>📋 قوالب الطلبات السريعة</h2>

            <h3>🏥 قوالب شائعة</h3>

            <button class="btn-secondary" style="width: 100%; justify-content: flex-start; margin: 8px 0;" onclick="loadTemplate('الربو')">
                🫁 <strong>أدوية الربو والحساسية</strong>
                <br><small>بخاخ الربو، مضادات الحساسية، إلخ</small>
            </button>

            <button class="btn-secondary" style="width: 100%; justify-content: flex-start; margin: 8px 0;" onclick="loadTemplate('السكري')">
                🩺 <strong>أدوية السكري</strong>
                <br><small>إنسولين، أقراص خفض السكر، إلخ</small>
            </button>

            <button class="btn-secondary" style="width: 100%; justify-content: flex-start; margin: 8px 0;" onclick="loadTemplate('الضغط')">
                ❤️ <strong>أدوية ضغط الدم</strong>
                <br><small>خافضات الضغط، مدرات البول، إلخ</small>
            </button>

            <button class="btn-secondary" style="width: 100%; justify-content: flex-start; margin: 8px 0;" onclick="loadTemplate('القلب')">
                💓 <strong>أدوية القلب</strong>
                <br><small>مضادات التجلط، موسعات الأوعية، إلخ</small>
            </button>

            <button class="btn-secondary" style="width: 100%; justify-content: flex-start; margin: 8px 0;" onclick="loadTemplate('رمضان')">
                🌙 <strong>طلب رمضاني متنوع</strong>
                <br><small>جرعات متعددة قبل وبعد الإفطار والسحور</small>
            </button>

            <div class="divider"></div>

            <h3>➕ إنشاء قالب مخصص</h3>

            <div class="form-group">
                <label>اسم القالب:</label>
                <input type="text" id="templateName" placeholder="اسم القالب الجديد">
            </div>

            <div class="form-group">
                <label>محتوى الطلب:</label>
                <textarea id="templateContent" placeholder="أدخل محتوى الطلب الذي تريد حفظه..."></textarea>
            </div>

            <div class="button-group mt-3">
                <button class="btn-success" onclick="saveCustomTemplate()">💾 حفظ القالب</button>
                <button class="btn-secondary" onclick="closeTemplatesDialog()">إغلاق</button>
            </div>
        </dialog>

        <!-- ================= منطقة الإدخال الرئيسية ================= -->

        <div class="input-section">
            <label for="orderInput">📋 أدخل الطلب الصيدلي الكامل:</label>
            <textarea id="orderInput" 
                      placeholder="أدخل الطلب الصيدلي هنا...
مثال 1: ابدأوكس 1 قرص كل يوم بعد الفطار، إنسولين 10 وحدات قبل السحور
مثال 2: دواء الربو 2 بخة كل 6 ساعات، مرهم جلدي يومياً قبل النوم
مثال 3: قطرات العين مرتين يومياً صباح ومساء، حقنة ب12 مرة واحدة أسبوعياً"></textarea>
        </div>

        <!-- أزرار المعالجة الرئيسية -->
        <div class="button-group">
            <button class="btn-success" onclick="processOrder()" style="font-size: 1.1em; padding: 15px 35px;">
                ✓ معالجة الطلب
            </button>
            <button class="btn-warning" onclick="previewOrder()">👁️ معاينة الطلب</button>
            <button class="btn-info" onclick="validateOrder()">✓ التحقق من الصحة</button>
            <button class="btn-primary" onclick="clearInput()">⟲ مسح المدخل</button>
            <button class="btn-secondary" onclick="loadExample()">📝 تحميل مثال</button>
        </div>

        <!-- منطقة التنبيهات -->
        <div id="alertsContainer" class="alerts-container"></div>

        <!-- منطقة البحث والفلترة -->
        <div class="search-filter-box">
            <input type="text" id="searchInput" placeholder="🔍 ابحث عن دواء أو صنف..." onkeyup="filterTable()">
            
            <select id="filterType" onchange="filterTable()">
                <option value="">-- عرض الكل --</option>
                <option value="عادي">جرعات عادية</option>
                <option value="duplicate">جرعات مكررة</option>
                <option value="single">جرعات فردية</option>
                <option value="warning">تنبيهات</option>
                <option value="سليمة">سليمة</option>
            </select>

            <select id="medicineType" onchange="filterTable()">
                <option value="">-- نوع الدواء --</option>
                <option value="قرص">أقراص</option>
                <option value="حقنة">حقن</option>
                <option value="شراب">أشربة</option>
                <option value="مرهم">مراهم</option>
                <option value="قطرة">قطرات</option>
            </select>

            <select id="sortBy" onchange="sortTable()">
                <option value="name">ترتيب أبجدي</option>
                <option value="time">حسب وقت البدء</option>
                <option value="frequency">حسب التكرار</option>
                <option value="type">حسب النوع</option>
                <option value="status">حسب الحالة</option>
            </select>
        </div>

        <!-- جدول الأدوية والجرعات الرئيسي -->
        <div class="table-section">
            <h2>📊 قائمة الأدوية والجرعات</h2>
            <div class="table-container">
                <table id="mainTable">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم الصنف</th>
                            <th>الجرعة</th>
                            <th>الملاحظات</th>
                            <th>التكرار</th>
                            <th>وقت البدء</th>
                            <th>اليوم</th>
                            <th>النوع</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                        <tr>
                            <td colspan="10" class="text-center">
                                <div class="empty-message">
                                    <div class="empty-icon">📋</div>
                                    <div>لا توجد بيانات - ادخل طلب صيدلي لبدء المعالجة</div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- جدول الجرعات المكررة -->
        <div id="duplicatesContainer" class="duplicates-section">
            <h3>📌 الجرعات المكررة المكتشفة</h3>
            <div class="table-container">
                <table id="duplicatesTable">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الصنف</th>
                            <th>الجرعة</th>
                            <th>الأوقات</th>
                            <th>الملاحظات</th>
                            <th>الإجراء</th>
                        </tr>
                    </thead>
                    <tbody id="duplicatesTableBody"></tbody>
                </table>
            </div>
        </div>

        <!-- الإحصائيات والمؤشرات -->
        <div class="table-section">
            <h2>📈 الإحصائيات والمؤشرات</h2>
            
            <div class="statistics-grid">
                <div class="stat-box stat-primary">
                    <div class="stat-number" id="totalByDay">0</div>
                    <div class="stat-label">الجرعات يومياً</div>
                </div>

                <div class="stat-box stat-success">
                    <div class="stat-number" id="averageFrequency">0</div>
                    <div class="stat-label">متوسط التكرار</div>
                </div>

                <div class="stat-box stat-warning">
                    <div class="stat-number" id="totalByWeek">0</div>
                    <div class="stat-label">الجرعات أسبوعياً</div>
                </div>

                <div class="stat-box stat-danger">
                    <div class="stat-number" id="criticalWarnings">0</div>
                    <div class="stat-label">تنبيهات حرجة</div>
                </div>
            </div>

            <div class="grid-2">
                <div style="background: linear-gradient(135deg, #e8f5e9, #fff); padding: 20px; border-radius: var(--border-radius); border-right: 5px solid #4caf50;">
                    <h3 style="color: #2e7d32; margin-bottom: 15px;">✓ الجرعات الصحيحة والسليمة</h3>
                    <span id="validItems" style="font-size: 2em; font-weight: bold; color: #4caf50;">0</span>
                </div>

                <div style="background: linear-gradient(135deg, #ffebee, #fff); padding: 20px; border-radius: var(--border-radius); border-right: 5px solid #f44336;">
                    <h3 style="color: #c62828; margin-bottom: 15px;">⚠️ الجرعات التي تحتاج مراجعة</h3>
                    <span id="problemItems" style="font-size: 2em; font-weight: bold; color: #f44336;">0</span>
                </div>
            </div>
        </div>

        <!-- نموذج التعديل المضمن -->
        <div id="inlineEditForm" class="inline-edit-form">
            <h3>✏️ تعديل بيانات الدواء</h3>

            <div class="form-group">
                <label>اسم الصنف:</label>
                <input type="text" id="editName" placeholder="اسم الدواء أو الصنف">
            </div>

            <div class="form-group">
                <label>الجرعة:</label>
                <input type="text" id="editDose" placeholder="مثال: 1 قرص، 10 وحدات، 2 بخة">
            </div>

            <div class="form-group">
                <label>الملاحظات:</label>
                <textarea id="editNotes" placeholder="ملاحظات إضافية مهمة..."></textarea>
            </div>

            <div class="form-group">
                <label>التكرار:</label>
                <input type="text" id="editFrequency" placeholder="مثال: يومياً، كل 6 ساعات، مرتين يومياً">
            </div>

            <div class="form-group">
                <label>وقت البدء:</label>
                <input type="time" id="editStartTime">
            </div>

            <div class="form-group">
                <label>النوع:</label>
                <select id="editType">
                    <option value="">اختر النوع</option>
                    <option value="قرص">قرص</option>
                    <option value="حقنة">حقنة</option>
                    <option value="شراب">شراب</option>
                    <option value="مرهم">مرهم</option>
                    <option value="قطرة">قطرة</option>
                    <option value="كريم">كريم</option>
                </select>
            </div>

            <div class="button-group">
                <button class="btn-success" onclick="saveInlineEdit()">💾 حفظ التعديل</button>
                <button class="btn-danger" onclick="cancelInlineEdit()">✕ إلغاء</button>
            </div>
        </div>

        <!-- الخلفية القابلة للتعديل -->
        <div id="editBackdrop" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1999;" onclick="cancelInlineEdit()"></div>
    </div>

    <!-- شريط الأدوات العائم -->
    <div class="floating-toolbar">
        <button class="floating-btn" onclick="scrollToTop()" title="أعلى الصفحة">⬆️</button>
        <button class="floating-btn" onclick="printTable()" title="طباعة">🖨️</button>
        <button class="floating-btn" onclick="openMainDialog()" title="الإعدادات">⚙️</button>
        <button class="floating-btn" onclick="showHelp()" title="المساعدة">❓</button>
    </div>

    <!-- سكريبت JavaScript الكامل -->
    <script>
        // ==================== المتغيرات العامة ====================
        let items = [];
        let currentMode = 'normal'; // normal أو ramadan
        let editingIndex = -1;
        let allWarnings = [];
        let allDuplicates = [];
        let currentRamadanSettings = {
            breakfastTime: '19:00',
            preBreakfastTime: '18:30',
            suhoorTime: '03:00',
            postSuhoorTime: '04:00'
        };

        // أوقات رمضان الثابتة
        const RAMADAN_TIMES = {
            'قبل الفطار': '18:30',
            'بعد الفطار': '19:00',
            'قبل السحور': '03:00',
            'بعد السحور': '04:00',
            'العشاء': '19:00',
            'قبل العشاء': '18:30',
            'بعد العشاء': '19:00',
            'السحور': '03:00',
            'قبل السحور والفطار': '18:30'
        };

        // الأنواع الخاصة (للجرعات الفردية)
        const SPECIAL_SINGLE_TYPES = [
            'injection', 'حقنة', 'حقن', 'شراب', 'أشربة', 'محلول', 'مرهم', 'مراهم', 'كريم', 'كريمات', 'قطرة', 'قطرات'
        ];

        // ==================== وظائف التحديث الأساسية ====================

        // تحديث الوقت والتاريخ
        function updateDateTime() {
            const now = new Date();
            
            // تحديث الوقت
            const timeString = now.toLocaleTimeString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            document.getElementById('currentTime').textContent = timeString;
            
            // تحديث التاريخ الميلادي
            const gregorianDate = now.toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('gregorianDate').textContent = gregorianDate;
            
            // تحديث التاريخ الهجري (تقريبي)
            const hijriDate = convertToHijri(now);
            document.getElementById('hijriDate').textContent = hijriDate;
        }

        // تحويل التاريخ إلى هجري
        function convertToHijri(gregorianDate) {
            const d = gregorianDate.getDate();
            const m = gregorianDate.getMonth() + 1;
            const y = gregorianDate.getFullYear();

            // حساب تقريبي للتاريخ الهجري
            const jd = Math.floor((11 * y + 3) / 30) + Math.floor(306001 * m / 10646) + d + Math.floor(y / 100) - Math.floor(y / 400) + 1948440 - 385;
            const z = Math.floor(jd + 0.5);
            const a = Math.floor((z - 1867216.25) / 36524.25);
            const b = z + 1 + a - Math.floor(a / 4);
            const c = Math.floor((b + 1524) / 365.25);
            const e = Math.floor((c - 122.1) * 365.25);
            const f = Math.floor((b - e) / 30.6001);
            const day = Math.floor(b - e - Math.floor(30.6001 * f));
            const month = Math.floor(f < 14 ? f - 1 : f - 13);
            const year = Math.floor(c - (month > 2 ? 4716 : 4715));

            const hijriMonths = [
                'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
                'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
                'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
            ];

            const hijriMonth = hijriMonths[(month - 1) % 12];
            return `${day} ${hijriMonth} ${year}ه`;
        }

        // تحديث شريط الحالة
        function updateStatusBar() {
            const total = items.length;
            const duplicates = items.filter(item => item.isDuplicate).length;
            const singleDoses = items.filter(item => item.isSingleDose).length;
            const warnings = allWarnings.length;

            document.getElementById('totalItems').textContent = total;
            document.getElementById('duplicateCount').textContent = duplicates;
            document.getElementById('singleDoseCount').textContent = singleDoses;
            document.getElementById('warningCount').textContent = warnings;
            document.getElementById('currentMode').textContent = currentMode === 'ramadan' ? '🌙 رمضان' : '📅 عادي';
        }

        // تحديث الإحصائيات
        function updateStatistics() {
            const dailyDoses = items.filter(i => i.frequency && i.frequency.toLowerCase().includes('يومي')).length;
            const weeklyDoses = items.filter(i => i.frequency && (i.frequency.toLowerCase().includes('أسبوع') || i.frequency.toLowerCase().includes('168'))).length;
            const avgFreq = items.length > 0 ? Math.ceil(items.length / 3) : 0;
            const criticalWarnings = allWarnings.filter(w => w.warningType === 'critical').length;
            const validItems = items.filter(i => !i.isWarning).length;
            const problemItems = items.filter(i => i.isWarning).length;

            document.getElementById('totalByDay').textContent = dailyDoses;
            document.getElementById('totalByWeek').textContent = weeklyDoses;
            document.getElementById('averageFrequency').textContent = avgFreq;
            document.getElementById('criticalWarnings').textContent = criticalWarnings;
            document.getElementById('validItems').textContent = validItems;
            document.getElementById('problemItems').textContent = problemItems;
        }

        // ==================== وظائف السويتشات والأنماط ====================

        // تبديل الوضع العادي
        function toggleNormalMode() {
            if (currentMode !== 'normal') {
                setMode('normal');
            }
        }

        // تبديل وضع رمضان
        function toggleRamadanMode() {
            if (currentMode !== 'ramadan') {
                setMode('ramadan');
            }
        }

        // تعيين الوضع
        function setMode(mode) {
            currentMode = mode;
            
            const normalSwitch = document.getElementById('normalModeSwitch');
            const ramadanSwitch = document.getElementById('ramadanModeSwitch');

            if (mode === 'normal') {
                normalSwitch.classList.add('active');
                ramadanSwitch.classList.remove('active');
                normalSwitch.classList.remove('inactive');
                ramadanSwitch.classList.add('inactive');
                showAlert('✓ تم التبديل إلى الوضع العادي', 'success');
            } else if (mode === 'ramadan') {
                ramadanSwitch.classList.add('active');
                normalSwitch.classList.remove('active');
                ramadanSwitch.classList.remove('inactive');
                normalSwitch.classList.add('inactive');
                showAlert('✓ تم التبديل إلى وضع رمضان 🌙', 'info');
            }

            // إعادة معالجة الطلب الحالي
            if (items.length > 0) {
                processOrder();
            }
        }

        // ==================== وظائف الديالوجات ====================

        function openMainDialog() {
            document.getElementById('mainDialog').showModal();
        }

        function closeMainDialog() {
            document.getElementById('mainDialog').close();
        }

        function closeWarningDialog() {
            document.getElementById('warningDialog').close();
        }

        function closeHelpDialog() {
            document.getElementById('helpDialog').close();
        }

        function openRamadanSettings() {
            document.getElementById('ramadanSettingsDialog').showModal();
        }

        function closeRamadanSettings() {
            document.getElementById('ramadanSettingsDialog').close();
        }

        function showTemplates() {
            document.getElementById('templatesDialog').showModal();
        }

        function closeTemplatesDialog() {
            document.getElementById('templatesDialog').close();
        }

        function showHelp() {
            document.getElementById('helpDialog').showModal();
        }

        // ==================== وظائف معالجة الطلب ====================

        // معالجة الطلب الرئيسية
        function processOrder() {
            const input = document.getElementById('orderInput').value.trim();
            
            if (!input) {
                showAlert('⚠️ الرجاء إدخال طلب صيدلي', 'warning');
                renderEmptyTable();
                updateStatusBar();
                return;
            }

            allWarnings = [];
            allDuplicates = [];
            items = [];

            // تحليل الطلب
            parseOrder(input);

            // تطبيق المنطق الخاص برمضان أو العادي
            if (currentMode === 'ramadan') {
                applyRamadanLogic();
            } else {
                applyNormalLogic();
            }

            // فحص التحذيرات
            checkWarnings();

            // تحديث الجداول والإحصائيات
            renderTable();
            updateStatusBar();
            updateStatistics();

            // عرض التنبيهات والدبليكيتس
            if (allDuplicates.length > 0 && document.getElementById('warningDuplicate').checked) {
                showAlert(`⚠️ تم اكتشاف ${allDuplicates.length} جرعات مكررة`, 'warning');
                if (allDuplicates.length === 1) {
                    showDuplicateDialog(allDuplicates[0]);
                }
            }

            if (allWarnings.length > 0 && document.getElementById('warningUnknown').checked) {
                showAlert(`⚡ توجد ${allWarnings.length} تنبيهات تحتاج مراجعة`, 'warning');
                if (allWarnings.length === 1) {
                    showWarningDialog(allWarnings[0]);
                }
            }

            showAlert('✓ تمت معالجة الطلب بنجاح', 'success');
        }

        // تحليل الطلب الصيدلي
        function parseOrder(input) {
            // تقسيم الطلب إلى أدوية منفصلة
            const medicineArray = input.split(/[،،]/);

            medicineArray.forEach(medicine => {
                const cleaned = medicine.trim();
                if (!cleaned || cleaned.length < 2) return;

                const item = {
                    name: extractMedicineName(cleaned),
                    dose: extractDose(cleaned),
                    notes: cleaned,
                    frequency: extractFrequency(cleaned),
                    startTime: extractTime(cleaned),
                    day: getNextDay(),
                    isDuplicate: false,
                    isSingleDose: false,
                    isWarning: false,
                    medicineType: identifyMedicineType(cleaned),
                    warningType: null
                };

                // فحص إذا كانت جرعة واحدة من نوع خاص
                if ((item.frequency.toLowerCase().includes('مرة واحدة') || 
                     item.frequency.toLowerCase().includes('واحدة فقط')) &&
                    SPECIAL_SINGLE_TYPES.some(type => item.name.toLowerCase().includes(type))) {
                    item.isSingleDose = true;
                    if (document.getElementById('warningSingleDose').checked) {
                        item.isWarning = true;
                        allWarnings.push({...item, warningType: 'single-dose'});
                    }
                }

                items.push(item);
            });
        }

        // استخراج اسم الدواء
        function extractMedicineName(text) {
            const namePattern = /^([^\d\(]+?)(?:\s+\d|\s*\(|\s+كل|\s+قبل|\s+بعد|$)/;
            const match = text.match(namePattern);
            return match ? match[1].trim() : text.split(/\d/)[0].trim();
        }

        // استخراج الجرعة
        function extractDose(text) {
            const dosePattern = /(\d+(?:\.\d+)?)\s*(قرص|حبة|وحدة|ملغ|جرام|ملل|نقطة|حقنة|injection|بخة|ملعقة)/gi;
            const match = text.match(dosePattern);
            return match ? match[0] : 'غير محدد';
        }

        // استخراج التكرار
        function extractFrequency(text) {
            const lowerText = text.toLowerCase();
            if (lowerText.includes('مرة واحدة') || lowerText.includes('واحدة فقط')) return 'مرة واحدة';
            if (lowerText.includes('يومي') || lowerText.includes('كل يوم')) return 'يومياً';
            if (lowerText.includes('كل 6 ساعات')) return 'كل 6 ساعات';
            if (lowerText.includes('كل 8 ساعات')) return 'كل 8 ساعات';
            if (lowerText.includes('كل 12 ساعة')) return 'كل 12 ساعة';
            if (lowerText.includes('مرتين')) return 'مرتين يومياً';
            if (lowerText.includes('ثلاث مرات')) return 'ثلاث مرات يومياً';
            if (lowerText.includes('أربع مرات')) return 'أربع مرات يومياً';
            if (lowerText.includes('أسبوع')) return 'أسبوعياً';
            if (lowerText.includes('168 ساعة')) return 'كل 7 أيام';
            return 'كل يوم';
        }

        // استخراج الوقت
        function extractTime(text) {
            // محاولة استخراج وقت محدد
            const timePattern = /(\d{1,2}):(\d{2})/;
            const match = text.match(timePattern);
            if (match) {
                return `${match[1].padStart(2, '0')}:${match[2]}`;
            }

            // في الوضع الطبيعي
            if (currentMode === 'normal') {
                const lowerText = text.toLowerCase();
                if (lowerText.includes('الفطار') || lowerText.includes('الغداء') || lowerText.includes('الظهر')) return '13:00';
                if (lowerText.includes('العشاء') || lowerText.includes('المساء')) return '20:00';
                if (lowerText.includes('الصباح')) return '08:00';
                if (lowerText.includes('النوم') || lowerText.includes('قبل النوم')) return '22:00';
                if (lowerText.includes('الصباح المبكر')) return '06:00';
                if (lowerText.includes('الظهيرة')) return '12:00';
            }

            return '09:00'; // الوقت الافتراضي
        }

        // تحديد نوع الدواء
        function identifyMedicineType(text) {
            const lowerText = text.toLowerCase();
            if (lowerText.includes('injection') || lowerText.includes('حقنة')) return 'حقنة';
            if (lowerText.includes('شراب') || lowerText.includes('محلول')) return 'شراب';
            if (lowerText.includes('قرص') || lowerText.includes('حبة') || lowerText.includes('تابلت')) return 'قرص';
            if (lowerText.includes('مرهم') || lowerText.includes('كريم')) return 'مرهم';
            if (lowerText.includes('قطرة')) return 'قطرة';
            if (lowerText.includes('بخاخ') || lowerText.includes('spray')) return 'بخاخ';
            if (lowerText.includes('فوار')) return 'فوار';
            if (lowerText.includes('شامبو')) return 'شامبو';
            return 'غير محدد';
        }

        // ==================== منطق رمضان ====================

        function applyRamadanLogic() {
            items.forEach((item, index) => {
                // البحث عن كلمات رمضان
                const text = item.notes.toLowerCase();
                let found = false;

                for (let key in RAMADAN_TIMES) {
                    if (text.includes(key.toLowerCase())) {
                        item.startTime = RAMADAN_TIMES[key];
                        item.isDuplicate = true; // كل الجرعات في رمضان مكررة
                        found = true;
                        break;
                    }
                }

                // إذا لم يجد، جرب البحث عن "العشاء" و"السحور"
                if (!found) {
                    if (text.includes('عشاء')) {
                        item.startTime = RAMADAN_TIMES['بعد الفطار'];
                        item.isDuplicate = true;
                    } else if (text.includes('سحور')) {
                        item.startTime = RAMADAN_TIMES['قبل السحور'];
                        item.isDuplicate = true;
                    }
                }

                // تحديد اليوم بناءً على الوقت
                if (item.startTime === '03:00' || item.startTime === '04:00') {
                    item.day = getNextNextDay(); // يوم تالي من التالي
                } else {
                    item.day = getNextDay(); // عادي
                }

                // كشف الدبليكيت
                if (item.isDuplicate && !allDuplicates.find(d => d.name === item.name && d.startTime === item.startTime)) {
                    allDuplicates.push(item);
                }

                // تطبيق التنبيه الخاص للجرعات الفردية
                if (item.isSingleDose && SPECIAL_SINGLE_TYPES.some(type => item.name.toLowerCase().includes(type))) {
                    if (document.getElementById('warningSingleDose').checked) {
                        item.isWarning = true;
                        allWarnings.push({...item, warningType: 'single-dose-ramadan'});
                    }
                }
            });
        }

        // المنطق العادي
        function applyNormalLogic() {
            items.forEach((item, index) => {
                // فحص الدبليكيت في الوضع العادي
                const duplicateCount = items.filter(i => i.name === item.name).length;
                if (duplicateCount > 1) {
                    item.isDuplicate = true;
                    if (!allDuplicates.find(d => d.name === item.name)) {
                        allDuplicates.push({...item, duplicateOf: item.name});
                    }
                }

                // إذا كانت جرعة واحدة فقط في الطلب كله
                if (items.length === 1 && item.frequency === 'مرة واحدة') {
                    item.isSingleDose = true;
                }
            });
        }

        // فحص التحذيرات
        function checkWarnings() {
            items.forEach((item, index) => {
                // تحذير من الوقت غير المحدد
                if (!item.startTime || item.startTime === '09:00') {
                    item.isWarning = true;
                    if (!allWarnings.find(w => w.name === item.name)) {
                        allWarnings.push({...item, warningType: 'no-time', index});
                    }
                }

                // تحذير من الجرعة غير المحددة
                if (item.dose === 'غير محدد') {
                    item.isWarning = true;
                    if (!allWarnings.find(w => w.name === item.name && w.warningType === 'no-dose')) {
                        allWarnings.push({...item, warningType: 'no-dose', index});
                    }
                }

                // تحذير من التكرار غير المحدد
                if (!item.frequency || item.frequency === 'كل يوم') {
                    item.isWarning = true;
                    if (!allWarnings.find(w => w.name === item.name && w.warningType === 'no-frequency')) {
                        allWarnings.push({...item, warningType: 'no-frequency', index});
                    }
                }
            });
        }

        // ==================== وظائف الجداول والعرض ====================

        // عرض الجدول الرئيسي
        function renderTable() {
            const tbody = document.getElementById('tableBody');

            if (items.length === 0) {
                renderEmptyTable();
                return;
            }

            tbody.innerHTML = items.map((item, index) => {
                let rowClass = '';
                let statusBadge = '';

                if (item.isDuplicate) {
                    rowClass = 'row-duplicate';
                    statusBadge = '<span class="badge badge-duplicate">مكررة</span>';
                } else if (item.isSingleDose) {
                    rowClass = 'row-single-dose';
                    statusBadge = '<span class="badge badge-single">فردية</span>';
                } else if (item.isWarning) {
                    rowClass = 'row-warning';
                    statusBadge = '<span class="badge badge-warning">تنبيه</span>';
                } else {
                    rowClass = 'row-normal';
                    statusBadge = '<span class="badge badge-normal">✓ سليمة</span>';
                }

                return `
                    <tr class="${rowClass}">
                        <td>${index + 1}</td>
                        <td><strong>${item.name}</strong></td>
                        <td>${item.dose}</td>
                        <td><small>${item.notes}</small></td>
                        <td>${item.frequency}</td>
                        <td><strong>${item.startTime}</strong></td>
                        <td>${item.day}</td>
                        <td><span class="badge badge-medicine">${item.medicineType}</span></td>
                        <td>${statusBadge}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-edit" onclick="editItem(${index})" title="تعديل">✏️</button>
                                <button class="action-btn btn-delete" onclick="deleteItem(${index})" title="حذف">🗑️</button>
                                ${item.isDuplicate ? `<button class="action-btn btn-duplicate" onclick="handleDuplicateAction(${index})" title="معالجة">⚠️</button>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            // عرض جدول الدبليكيت إن وجد
            if (allDuplicates.length > 0) {
                renderDuplicatesTable();
            } else {
                document.getElementById('duplicatesContainer').classList.remove('show');
            }
        }

        // عرض جدول فارغ
        function renderEmptyTable() {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center">
                        <div class="empty-message">
                            <div class="empty-icon">📋</div>
                            <div><strong>لا توجد بيانات</strong></div>
                            <div style="font-size: 0.9em; color: #999;">ادخل طلب صيدلي لبدء المعالجة</div>
                        </div>
                    </td>
                </tr>
            `;
        }

        // عرض جدول الدبليكيت
        function renderDuplicatesTable() {
            const container = document.getElementById('duplicatesContainer');
            const tbody = document.getElementById('duplicatesTableBody');

            container.classList.add('show');

            tbody.innerHTML = allDuplicates.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.dose}</td>
                    <td>${item.startTime}</td>
                    <td>${item.notes}</td>
                    <td>
                        <button class="action-btn btn-warning" onclick="showDuplicateDialog({index: ${index}})">معالجة</button>
                    </td>
                </tr>
            `).join('');
        }

        // ==================== الفلترة والترتيب ====================

        // فلترة الجدول
        function filterTable() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const filterType = document.getElementById('filterType').value;
            const medicineType = document.getElementById('medicineType').value;
            const rows = document.querySelectorAll('#tableBody tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                const rowClass = row.className;

                let typeMatch = true;
                let medicineTypeMatch = true;

                // فلترة حسب نوع الحالة
                if (filterType === 'duplicate') typeMatch = rowClass.includes('duplicate');
                else if (filterType === 'single') typeMatch = rowClass.includes('single-dose');
                else if (filterType === 'warning') typeMatch = rowClass.includes('warning');
                else if (filterType === 'عادي') typeMatch = rowClass.includes('row-normal');
                else if (filterType === 'سليمة') typeMatch = rowClass.includes('row-normal');

                // فلترة حسب نوع الدواء
                if (medicineType && !text.includes(medicineType)) {
                    medicineTypeMatch = false;
                }

                const searchMatch = text.includes(searchTerm);

                row.style.display = (typeMatch && medicineTypeMatch && searchMatch) ? '' : 'none';
            });
        }

        // ترتيب الجدول
        function sortTable() {
            const sortBy = document.getElementById('sortBy').value;
            
            const itemsCopy = [...items];

            switch(sortBy) {
                case 'name':
                    itemsCopy.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
                    break;
                case 'time':
                    itemsCopy.sort((a, b) => a.startTime.localeCompare(b.startTime));
                    break;
                case 'frequency':
                    itemsCopy.sort((a, b) => a.frequency.localeCompare(b.frequency, 'ar'));
                    break;
                case 'type':
                    itemsCopy.sort((a, b) => a.medicineType.localeCompare(b.medicineType, 'ar'));
                    break;
                case 'status':
                    itemsCopy.sort((a, b) => {
                        const statusOrder = {'error': 0, 'warning': 1, 'duplicate': 2, 'normal': 3};
                        let aStatus = 'normal';
                        let bStatus = 'normal';
                        if (a.isDuplicate) aStatus = 'duplicate';
                        else if (a.isWarning) aStatus = 'warning';
                        if (b.isDuplicate) bStatus = 'duplicate';
                        else if (b.isWarning) bStatus = 'warning';
                        return (statusOrder[aStatus] || 3) - (statusOrder[bStatus] || 3);
                    });
                    break;
            }

            items = itemsCopy;
            renderTable();
        }

        // ==================== التعديل والحذف ====================

        // تعديل عنصر
        function editItem(index) {
            editingIndex = index;
            const item = items[index];

            document.getElementById('editName').value = item.name;
            document.getElementById('editDose').value = item.dose;
            document.getElementById('editNotes').value = item.notes;
            document.getElementById('editFrequency').value = item.frequency;
            document.getElementById('editStartTime').value = item.startTime;
            document.getElementById('editType').value = item.medicineType;

            document.getElementById('inlineEditForm').classList.add('active');
            document.getElementById('editBackdrop').style.display = 'block';
            window.scrollTo(0, 0);
        }

        // حفظ التعديل
        function saveInlineEdit() {
            if (editingIndex >= 0 && editingIndex < items.length) {
                items[editingIndex].name = document.getElementById('editName').value || 'بدون اسم';
                items[editingIndex].dose = document.getElementById('editDose').value || 'غير محدد';
                items[editingIndex].notes = document.getElementById('editNotes').value;
                items[editingIndex].frequency = document.getElementById('editFrequency').value || 'كل يوم';
                items[editingIndex].startTime = document.getElementById('editStartTime').value;
                items[editingIndex].medicineType = document.getElementById('editType').value || 'غير محدد';

                cancelInlineEdit();
                renderTable();
                updateStatusBar();
                updateStatistics();
                showAlert('✓ تم تحديث البيانات بنجاح', 'success');
            }
        }

        // إلغاء التعديل
        function cancelInlineEdit() {
            document.getElementById('inlineEditForm').classList.remove('active');
            document.getElementById('editBackdrop').style.display = 'none';
            editingIndex = -1;
        }

        // حذف عنصر
        function deleteItem(index) {
            if (confirm('هل تريد حذف هذا العنصر؟')) {
                items.splice(index, 1);
                renderTable();
                updateStatusBar();
                updateStatistics();
                showAlert('✓ تم حذف العنصر', 'success');
            }
        }

        // ==================== التنبيهات والتحذيرات ====================

        // عرض رسالة تنبيه
        function showAlert(message, type = 'info') {
            const container = document.getElementById('alertsContainer');
            const alertDiv = document.createElement('div');
            
            const icons = {
                success: '✓',
                warning: '⚠️',
                danger: '✕',
                info: 'ℹ️'
            };

            alertDiv.className = `alert alert-${type}`;
            alertDiv.innerHTML = `
                <span class="alert-icon">${icons[type] || icons.info}</span>
                <span class="alert-content">${message}</span>
                <span class="alert-close" onclick="this.parentElement.remove()">✕</span>
            `;
            container.appendChild(alertDiv);

            setTimeout(() => {
                if (alertDiv.parentElement) {
                    alertDiv.remove();
                }
            }, 6000);
        }

        // عرض ديالوج الدبليكيت
        function showDuplicateDialog(item) {
            if (typeof item === 'object' && item.index !== undefined) {
                item = allDuplicates[item.index] || items[item.index];
            }
            if (!item) return;

            document.getElementById('dupItemName').textContent = item.name;
            document.getElementById('dupDose').textContent = item.dose;
            document.getElementById('dupEvery').textContent = item.frequency;
            document.getElementById('dupStartTime').textContent = item.startTime;
            document.getElementById('dupSuggestedDay').textContent = item.day;
            document.getElementById('duplicateDialog').showModal();
        }

        // تأكيد معالجة الدبليكيت
        function confirmDuplicate() {
            const cancelSplit = document.getElementById('cancelSplitCheckbox').checked;
            const nextMonth = document.getElementById('nextMonthCheckbox').checked;
            const applyToAll = document.getElementById('applyToAllDuplicates').checked;

            if (cancelSplit) {
                if (applyToAll) {
                    items = items.filter(item => !item.isDuplicate);
                    showAlert('✓ تم إلغاء جميع الجرعات المكررة', 'success');
                } else {
                    items = items.filter(item => item !== allDuplicates[0]);
                    showAlert('✓ تم إلغاء الجرعات المكررة', 'success');
                }
            }

            if (nextMonth) {
                showAlert('✓ تم تفعيل الشهر التالي تلقائياً', 'success');
            }

            document.getElementById('duplicateDialog').close();
            renderTable();
            updateStatusBar();
        }

        // تأجيل القرار
        function postponeDuplicate() {
            document.getElementById('duplicateDialog').close();
            showAlert('⏸️ تم تأجيل القرار', 'info');
        }

        // تجاهل التحذير
        function ignoreDuplicate() {
            document.getElementById('duplicateDialog').close();
        }

        // عرض ديالوج التحذير
        function showWarningDialog(warning) {
            document.getElementById('warningItemName').textContent = warning.name;
            document.getElementById('warningDoseText').textContent = warning.dose;
            document.getElementById('warningEveryText').textContent = warning.frequency;
            document.getElementById('warningStartTimeText').textContent = warning.startTime;
            document.getElementById('warningNotesText').textContent = warning.notes || 'بدون ملاحظات';

            document.getElementById('warningEditName').value = warning.name;
            document.getElementById('warningEditDose').value = warning.dose;
            document.getElementById('warningEditEvery').value = warning.frequency;
            document.getElementById('warningEditStartTime').value = warning.startTime;
            document.getElementById('warningEditNotes').value = warning.notes || '';

            document.getElementById('warningDialog').showModal();
        }

        // تطبيق إصلاح التحذير
        function applyWarningFix() {
            const name = document.getElementById('warningItemName').textContent;
            const index = items.findIndex(item => item.name === name);
            
            if (index >= 0) {
                items[index].name = document.getElementById('warningEditName').value;
                items[index].dose = document.getElementById('warningEditDose').value;
                items[index].frequency = document.getElementById('warningEditEvery').value;
                items[index].startTime = document.getElementById('warningEditStartTime').value;
                items[index].notes = document.getElementById('warningEditNotes').value;
                items[index].isWarning = false;
            }

            document.getElementById('warningDialog').close();
            renderTable();
            updateStatusBar();
            showAlert('✓ تم تصحيح البيانات', 'success');
        }

        // قبول كما هو
        function acceptAsIs() {
            const name = document.getElementById('warningItemName').textContent;
            const index = items.findIndex(item => item.name === name);
            if (index >= 0) {
                items[index].isWarning = false;
            }
            document.getElementById('warningDialog').close();
            renderTable();
            showAlert('✓ تم قبول البيانات', 'success');
        }

        // حذف عنصر من التحذيرات
        function removeWarningItem() {
            const name = document.getElementById('warningItemName').textContent;
            items = items.filter(item => item.name !== name);
            document.getElementById('warningDialog').close();
            renderTable();
            updateStatusBar();
            showAlert('✓ تم حذف العنصر', 'success');
        }

        function closeWarningDialog() {
            document.getElementById('warningDialog').close();
        }

        // معالجة الدبليكيت
        function handleDuplicateAction(index) {
            const item = items[index];
            if (item) {
                showDuplicateDialog(item);
            }
        }

        // ==================== وظائف إضافية ====================

        // معاينة الطلب
        function previewOrder() {
            if (items.length === 0) {
                showAlert('⚠️ لا توجد بيانات للمعاينة', 'warning');
                return;
            }
            const preview = items.map((item, i) => 
                `${i+1}. ${item.name} - ${item.dose} - ${item.frequency} - الساعة ${item.startTime}`
            ).join('\n');
            alert('معاينة الطلب:\n\n' + preview);
        }

        // التحقق من صحة الطلب
        function validateOrder() {
            if (items.length === 0) {
                showAlert('⚠️ لا توجد بيانات للتحقق', 'warning');
                return;
            }

            let valid = 0;
            let invalid = 0;

            items.forEach(item => {
                if (item.startTime && item.startTime !== '09:00' && item.dose !== 'غير محدد' && item.frequency) {
                    valid++;
                } else {
                    invalid++;
                }
            });

            showAlert(`✓ صحة الطلب: ${valid} صحيح و ${invalid} يحتاج تصحيح`, 'info');
        }

        // مسح الإدخال
        function clearInput() {
            document.getElementById('orderInput').value = '';
            document.getElementById('orderInput').focus();
            showAlert('✓ تم مسح الإدخال', 'info');
        }

        // تحميل مثال
        function loadExample() {
            const example = `ابدأوكس 1 قرص يومياً بعد الفطار، إنسولين 10 وحدات قبل السحور، دواء الربو بخة واحدة كل 6 ساعات، مرهم جلدي يومياً قبل النوم`;
            document.getElementById('orderInput').value = example;
            document.getElementById('orderInput').focus();
            showAlert('✓ تم تحميل مثال، اضغط معالجة للمتابعة', 'info');
        }

        // مسح جميع البيانات
        function clearAllData() {
            if (confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
                items = [];
                allWarnings = [];
                allDuplicates = [];
                document.getElementById('orderInput').value = '';
                document.getElementById('alertsContainer').innerHTML = '';
                renderEmptyTable();
                updateStatusBar();
                updateStatistics();
                showAlert('✓ تم مسح جميع البيانات', 'success');
            }
        }

        // تصدير البيانات
        function exportData() {
            const dataStr = JSON.stringify({
                items: items,
                mode: currentMode,
                exportDate: new Date().toISOString()
            }, null, 2);
            
            const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `medicines_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
            showAlert('✓ تم تصدير البيانات', 'success');
        }

        // تصدير CSV
        function exportToCSV() {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "اسم الصنف,الجرعة,التكرار,الوقت,اليوم,النوع,الحالة\n";
            
            items.forEach(item => {
                const status = item.isDuplicate ? 'مكررة' : (item.isSingleDose ? 'فردية' : 'سليمة');
                csvContent += `"${item.name}","${item.dose}","${item.frequency}","${item.startTime}","${item.day}","${item.medicineType}","${status}"\n`;
            });
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `medicines_${new Date().toISOString().split('T')[0]}.csv`);
            link.click();
            showAlert('✓ تم تصدير البيانات إلى CSV', 'success');
        }

        // استيراد البيانات
        function importData() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = event => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (data.items && Array.isArray(data.items)) {
                            items = data.items;
                            if (data.mode) {
                                setMode(data.mode);
                            }
                            renderTable();
                            updateStatusBar();
                            updateStatistics();
                            showAlert('✓ تم استيراد البيانات بنجاح', 'success');
                        } else {
                            showAlert('✕ صيغة الملف غير صحيحة', 'danger');
                        }
                    } catch (error) {
                        showAlert('✕ خطأ في قراءة الملف: ' + error.message, 'danger');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        }

        // طباعة الجدول
        function printTable() {
            const table = document.getElementById('mainTable').outerHTML;
            const printWindow = window.open('', '', 'height=600,width=1200');
            printWindow.document.write(`
                <html>
                <head>
                    <title>طباعة الأدوية والجرعات</title>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; direction: rtl; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
                        th { background-color: #4CAF50; color: white; }
                        h1 { text-align: center; }
                        .print-date { text-align: center; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <h1>قائمة الأدوية والجرعات</h1>
                    <p class="print-date">التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
                    ${table}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }

        // التمرير للأعلى
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // ==================== إعدادات رمضان ====================

        function applyRamadanSettings() {
            currentRamadanSettings = {
                breakfastTime: document.getElementById('ramadanBreakfastTime').value,
                preBreakfastTime: document.getElementById('ramadanPreBreakfastTime').value,
                suhoorTime: document.getElementById('ramadanSuhoorTime').value,
                postSuhoorTime: document.getElementById('ramadanPostSuhoorTime').value
            };

            // تحديث أوقات رمضان
            RAMADAN_TIMES['بعد الفطار'] = currentRamadanSettings.breakfastTime;
            RAMADAN_TIMES['قبل الفطار'] = currentRamadanSettings.preBreakfastTime;
            RAMADAN_TIMES['بعد السحور'] = currentRamadanSettings.postSuhoorTime;
            RAMADAN_TIMES['قبل السحور'] = currentRamadanSettings.suhoorTime;

            closeRamadanSettings();
            showAlert('✓ تم حفظ إعدادات رمضان', 'success');

            // إعادة معالجة الطلب إذا كان في وضع رمضان
            if (currentMode === 'ramadan' && items.length > 0) {
                processOrder();
            }
        }

        function resetRamadanSettings() {
            document.getElementById('ramadanBreakfastTime').value = '19:00';
            document.getElementById('ramadanPreBreakfastTime').value = '18:30';
            document.getElementById('ramadanSuhoorTime').value = '03:00';
            document.getElementById('ramadanPostSuhoorTime').value = '04:00';
            showAlert('✓ تم إعادة تعيين الإعدادات', 'info');
        }

        // ==================== القوالب ====================

        function loadTemplate(type) {
            let template = '';

            switch(type) {
                case 'الربو':
                    template = 'بخاخ الربو 2 بخة كل 8 ساعات بعد الإفطار، مضاد حساسية قرص واحد يومياً قبل النوم، أمبولة استنشاق مرة واحدة قبل الرياضة';
                    break;
                case 'السكري':
                    template = 'إنسولين 10 وحدات قبل الإفطار، إنسولين 15 وحدة قبل السحور، قرص السكري 1 مع الفطار و1 مع السحور';
                    break;
                case 'الضغط':
                    template = 'أملودابين قرص واحد يومياً، لوسارتان قرص واحد يومياً بعد الإفطار';
                    break;
                case 'القلب':
                    template = 'أسبرين قرص واحد يومياً صباحاً، أتينولول قرص واحد يومياً مساءً';
                    break;
                case 'رمضان':
                    template = `ابدأوكس 1 قرص بعد الفطار، إنسولين 10 وحدات قبل السحور، دواء الربو كل 6 ساعات، مضاد حموضة شراب بعد الإفطار`;
                    break;
            }

            document.getElementById('orderInput').value = template;
            closeTemplatesDialog();
            showAlert('✓ تم تحميل القالب', 'info');
        }

        function saveCustomTemplate() {
            const name = document.getElementById('templateName').value.trim();
            const content = document.getElementById('templateContent').value.trim();

            if (!name || !content) {
                showAlert('⚠️ الرجاء إدخال اسم وإدخال الطلب', 'warning');
                return;
            }

            // حفظ في LocalStorage
            let templates = JSON.parse(localStorage.getItem('customTemplates') || '{}');
            templates[name] = content;
            localStorage.setItem('customTemplates', JSON.stringify(templates));

            document.getElementById('templateName').value = '';
            document.getElementById('templateContent').value = '';

            showAlert(`✓ تم حفظ القالب "${name}"`, 'success');
        }

        // ==================== إعادة الإعدادات ====================

        function resetSettings() {
            if (confirm('هل تريد إعادة تعيين جميع الإعدادات؟')) {
                document.getElementById('breakfastTime').value = '19:00';
                document.getElementById('suhoorTime').value = '03:00';
                document.getElementById('preBreakfastTime').value = '18:30';
                document.getElementById('postSuhoorTime').value = '04:00';
                document.getElementById('warningDuplicate').checked = true;
                document.getElementById('warningUnknown').checked = true;
                document.getElementById('warningSingleDose').checked = true;
                document.getElementById('warningSpecialTypes').checked = true;
                showAlert('✓ تم إعادة تعيين الإعدادات', 'success');
            }
        }

        // ==================== الحصول على التواريخ ====================

        // الحصول على اليوم التالي
        function getNextDay() {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toLocaleDateString('ar-EG', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        // الحصول على اليوم التالي من التالي
        function getNextNextDay() {
            const dayAfterTomorrow = new Date();
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
            return dayAfterTomorrow.toLocaleDateString('ar-EG', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        // ==================== التهيئة ====================

        // تهيئة الصفحة
        function initialize() {
            updateDateTime();
            setInterval(updateDateTime, 1000);
            renderEmptyTable();
            updateStatusBar();
            updateStatistics();
            setMode('normal'); // البدء بالوضع العادي
            showAlert('✓ تم تحميل النظام بنجاح', 'success');
        }

        // ==================== معالجات الأحداث ====================

        // إغلاق الديالوج بالنقر خارجه
        document.querySelectorAll('dialog').forEach(dialog => {
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    dialog.close();
                }
            });

            // إغلاق بـ ESC
            dialog.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    dialog.close();
                }
            });
        });

        // الاستماع إلى Enter في منطقة الإدخال
        document.getElementById('orderInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                processOrder();
            }
        });

        // استدعاء التهيئة عند تحميل الصفحة
        window.addEventListener('load', initialize);

        // حفظ البيانات تلقائياً
        window.addEventListener('beforeunload', () => {
            if (items.length > 0) {
                localStorage.setItem('lastItems', JSON.stringify(items));
            }
        });
    </script>
</body>
</html>
