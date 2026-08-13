import os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def create_presentation():
    pdf_filename = "/Users/raghureddy/project/FitMaster_AI_Project_Presentation.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=landscape(letter),
        rightMargin=0.5*inch,
        leftMargin=0.5*inch,
        topMargin=0.4*inch,
        bottomMargin=0.4*inch
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=15
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155")
    )

    bold_body = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor("#0f172a")
    )

    code_tag = ParagraphStyle(
        'CodeTag',
        parent=body_style,
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#2563eb")
    )

    story = []

    # ── SLIDE 1: Project Overview & Tech Stack ──
    story.append(Paragraph("FitMaster AI — Project Presentation", title_style))
    story.append(Paragraph("A modern, AI-powered Digital Fitness & Nutrition Coach application built with Next.js", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#cbd5e1"), spaceAfter=15))

    overview_table_data = [
        [
            Paragraph("<b>Core Purpose</b>", bold_body),
            Paragraph("Full-stack web application providing personalized workout planning, real camera food macro scanning, interactive analytics, and AI fitness coaching.", body_style)
        ],
        [
            Paragraph("<b>Architecture Pattern</b>", bold_body),
            Paragraph("Monolithic Next.js 16 App Router architecture combining React 19 Frontend components and Server API Route handlers in a unified codebase.", body_style)
        ],
        [
            Paragraph("<b>Target Audience</b>", bold_body),
            Paragraph("Fitness enthusiasts tracking daily macros, body transformation goals (Bulking, Cutting, Lean Bulk), and structured strength workouts.", body_style)
        ]
    ]

    t1 = Table(overview_table_data, colWidths=[2.2*inch, 7.8*inch])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f1f5f9")),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#1e293b")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t1)
    story.append(Spacer(1, 15))

    story.append(Paragraph("Tech Stack At A Glance", section_heading))

    tech_stack_data = [
        [
            Paragraph("<b>Layer</b>", bold_body),
            Paragraph("<b>Technologies & Libraries Used</b>", bold_body),
            Paragraph("<b>Key Responsibility</b>", bold_body)
        ],
        [
            Paragraph("<b>Frontend UI</b>", code_tag),
            Paragraph("Next.js 16 (App Router), React 19, TypeScript, TailwindCSS v4, Lucide React Icons", body_style),
            Paragraph("Responsive dark theme UI, interactive modals, state management, and HTML5 Web Camera integration.", body_style)
        ],
        [
            Paragraph("<b>Backend API</b>", code_tag),
            Paragraph("Next.js Route Handlers (<code>app/api/.../route.ts</code>), Node.js", body_style),
            Paragraph("RESTful endpoints for Auth, User Profiles, Meals CRUD, Workout Plan Generation, and Weight Analytics.", body_style)
        ],
        [
            Paragraph("<b>Data Layer</b>", code_tag),
            Paragraph("In-Memory Persistent Database Store (<code>lib/db.ts</code>) & LocalStorage Session", body_style),
            Paragraph("Manages user accounts, baseline 0-macro resets, exercise libraries, and transformation target math.", body_style)
        ]
    ]

    t_tech = Table(tech_stack_data, colWidths=[1.8*inch, 4.5*inch, 3.7*inch])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_tech)

    story.append(PageBreak())

    # ── SLIDE 2: Frontend Architecture & Features ──
    story.append(Paragraph("Frontend Architecture & Feature Breakdown", title_style))
    story.append(Paragraph("Simple explanation of how the user interface is structured and works", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#cbd5e1"), spaceAfter=15))

    fe_features = [
        [
            Paragraph("<b>Feature Component</b>", bold_body),
            Paragraph("<b>How It Works & What Was Used</b>", bold_body),
            Paragraph("<b>User Impact</b>", bold_body)
        ],
        [
            Paragraph("<b>Interactive Dashboard</b><br/>(<code>app/page.tsx</code>)", code_tag),
            Paragraph("Built with React 19 client components and <code>AppContext</code> hook. Features 0-start metric cards (Calories, Protein, Water, Steps) and meal delete buttons.", body_style),
            Paragraph("Provides clear real-time tracking. All totals start clean at 0 on page refresh.", body_style)
        ],
        [
            Paragraph("<b>Onboarding & Auth</b><br/>(<code>AuthModal.tsx</code>)", code_tag),
            Paragraph("Captures user Name, Body Weight (BW), Height, and Transformation Goal (Bulking, Cutting, Lean Bulk). Supports Email/Phone login.", body_style),
            Paragraph("Customizes macro targets based on personal body weight and selected goal.", body_style)
        ],
        [
            Paragraph("<b>6-Exercise Workout Plan</b><br/>(<code>app/workout/page.tsx</code>)", code_tag),
            Paragraph("Dynamic workout selector supporting Push, Pull, Legs, and Full Body with 2 variations each. Each day generates <b>exactly 6 structured exercises</b>.", body_style),
            Paragraph("Gives structured strength plans with target weights auto-scaled to user body weight.", body_style)
        ],
        [
            Paragraph("<b>Real Camera Scanner</b><br/>(<code>app/food/page.tsx</code>)", code_tag),
            Paragraph("Uses HTML5 <code>navigator.mediaDevices.getUserMedia</code> to open device webcam, capture snapshot canvas, and run AI macro calculation.", body_style),
            Paragraph("Allows scanning real food photos to log calories and macros starting from 0.", body_style)
        ],
        [
            Paragraph("<b>Progress Analytics</b><br/>(<code>app/progress/page.tsx</code>)", code_tag),
            Paragraph("Calculates session volume lifted from completed exercise sets, step counts, and interactive weight trend line graphs.", body_style),
            Paragraph("Displays real milestone trends over 7D, 30D, and 90D timeframes.", body_style)
        ]
    ]

    t_fe = Table(fe_features, colWidths=[2.2*inch, 4.8*inch, 3.0*inch])
    t_fe.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_fe)

    story.append(PageBreak())

    # ── SLIDE 3: Backend Architecture & API Endpoints ──
    story.append(Paragraph("Backend Architecture & API Endpoints Summary", title_style))
    story.append(Paragraph("Simple breakdown of backend API routes, database logic, and calculations", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#cbd5e1"), spaceAfter=15))

    be_routes = [
        [
            Paragraph("<b>API Endpoint</b>", bold_body),
            Paragraph("<b>HTTP Method</b>", bold_body),
            Paragraph("<b>Function & Business Logic</b>", bold_body)
        ],
        [
            Paragraph("<code>/api/auth/register</code>", code_tag),
            Paragraph("<b>POST</b>", bold_body),
            Paragraph("Registers a new account using Email or Phone Number, Name, Weight, Height, and Goal. Persists session.", body_style)
        ],
        [
            Paragraph("<code>/api/auth/login</code>", code_tag),
            Paragraph("<b>POST</b>", bold_body),
            Paragraph("Authenticates existing users via Email/Phone & Password, restoring saved profile data.", body_style)
        ],
        [
            Paragraph("<code>/api/user/profile</code>", code_tag),
            Paragraph("<b>GET / POST</b>", bold_body),
            Paragraph("Calculates target macros based on Transformation Goal:<br/>• <b>Bulking:</b> +500 kcal surplus<br/>• <b>Cutting:</b> -400 kcal deficit<br/>• <b>Lean Bulk:</b> +250 kcal clean surplus", body_style)
        ],
        [
            Paragraph("<code>/api/metrics</code>", code_tag),
            Paragraph("<b>GET</b> (<code>?reset=true</code>)", bold_body),
            Paragraph("Resets current daily macro counters (Calories, Protein, Carbs, Fat, Water, Steps) cleanly to 0 on page refresh.", body_style)
        ],
        [
            Paragraph("<code>/api/meals</code>", code_tag),
            Paragraph("<b>POST / DELETE</b>", bold_body),
            Paragraph("Adds logged meals to daily metrics starting from 0, or deletes meals and subtracts macros cleanly.", body_style)
        ],
        [
            Paragraph("<code>/api/workout/generate</code>", code_tag),
            Paragraph("<b>POST</b>", bold_body),
            Paragraph("Generates structured <b>6-exercise workout plans</b> for Push, Pull, Legs, or Full Body tailored to body weight.", body_style)
        ],
        [
            Paragraph("<code>/api/ai/chat</code>", code_tag),
            Paragraph("<b>POST</b>", bold_body),
            Paragraph("Gemini AI Coach prompt engine providing personalized advice addressing the user by Name.", body_style)
        ]
    ]

    t_be = Table(be_routes, colWidths=[2.5*inch, 1.3*inch, 6.2*inch])
    t_be.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_be)

    doc.build(story)
    print("PDF Presentation successfully generated at:", pdf_filename)

if __name__ == "__main__":
    create_presentation()
