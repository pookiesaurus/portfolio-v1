/* ===================================================================
   Project data — each object becomes one window when its trigger
   (.pw-trigger[data-project-id="..."]) is clicked.

   This file is what the Project Window Builder tool generates.
   Paste new entries into this array, or hand-edit directly.

   Field reference:
   id        — unique string, must match data-project-id on the trigger
   title     — shown in titlebar + as the H1 inside the window
   eyebrow   — small label above the title (e.g. "UNI PROJECT")
   date      — e.g. "June 2026"
   tags      — array of short strings, e.g. ["Uni Project", "Game Design"]
   links     — optional row of link buttons shown right under the title
               (above tags/date/info). Each item: { label: "...", url: "..." }
               Recognized labels get a matching icon automatically
               (GitHub, Figma, "Live"/"Demo"/"Site"/"Visit"); anything
               else gets a generic external-link arrow. Example:
               links: [
                 { label: "View Live", url: "https://ryanpham.com.au" },
                 { label: "GitHub", url: "https://github.com/..." }
               ]
   info      — optional fact-sheet row shown as horizontal stat blocks,
               just under tags/date. All fields optional:
               {
                 timeline: "Feb – June 2026",
                 role: "Visual Director, UX Designer",
                 team: [
                   "Solo project"                              // plain string, OR
                   { name: "Jane Doe", role: "Sound Design" }   // name + role
                 ],
                 disciplines: ["UX Design", "Game Design", "Illustration"]
               }
   gallery   — array of image URLs for the horizontal strip at the top
   blocks    — ordered array of content blocks, each either:
               { type: "text", label: "INTRODUCTION", content: "..." }
                 — start any line with "## " to make it a subheading
                 inside the block (e.g. "## Process\nWe started by...").
                 Blank lines still separate paragraphs as before.
                 — write [label](url) anywhere in the text to make an
                 inline link, e.g. "check out the [live site](https://...)".
                 Only http(s)/mailto/tel/relative links are allowed —
                 anything else renders as plain text instead of a link.
               { type: "images", label: "PROCESS", items: [
                   { src: "...", caption: "..." }
                 ]}
               { type: "video", label: "DEMO", src: "...", caption: "..." }
                 — src can be a direct file (.mp4/.webm) OR a YouTube
                 / Vimeo link (youtube.com/watch?v=..., youtu.be/...,
                 vimeo.com/...) — both are auto-detected and embedded
                 full window-width. For direct files only, you can also
                 add poster: "..." for a thumbnail shown before play.

   ---------------- OVERRIDES (all optional) ----------------

   theme — plain object of design-token overrides, scoped to just this
           window (set as inline CSS variables, so nothing else on the
           page is touched). Supported keys:
             accent, bg, bgSolid, border, text, textDim,
             radius, titlebarBg, fontFamily
           Example:
             theme: { accent: "#7c1f2a", bgSolid: "#f4eee2",
                       fontFamily: "'Fraunces', serif" }

   windowClass — string of one or more class names added to the window's
           root element, for overrides theme vars can't reach (custom
           border treatment, background image, bespoke titlebar, etc).
           Write the matching CSS rule yourself, e.g. in a separate
           project-overrides.css file:
             .pw-window-blueprint .pw-titlebar { ... }
           Example: windowClass: "pw-window-blueprint"

   customHTML — raw HTML string. If present, this REPLACES the entire
           standard body template (eyebrow/title/meta/gallery/blocks
           are ignored). Use for one-off bespoke layouts. You're
           responsible for all markup and styling inside it — the
           window chrome (titlebar, drag, resize) still works normally.
   =================================================================== */

window.PROJECTS = [
      {
    id: "creative-futures-design",
    title: "Creative Futures Design",
    eyebrow: "Future Focused Design",
    date: "June 2026",
    links: [
      { label: "Part 1: Futures Thinking", url: "https://www.figma.com/deck/imhBRqbJAKpBed4OENqoYH/futures-thinking-presentation?node-id=1-42&t=2md3E50o779zK6DV-1" },
      { label: "Part 2: Conceptual Design", url: "https://www.figma.com/deck/QefP3dd7f9epDklZwfs50s/Group2.1-A2G2-ConceptualDesign?node-id=1-42&t=BaHI0y0rHGD5ke0M-1" },
      { label: "Part 3: Refined Prototype", url: "https://www.figma.com/deck/L0DQ1LSmhsKFbyfyk3SmRm/Group2.1-A2G3?node-id=17-1194&t=AAsbI1cadyOBnNlv-1" }
    ],
    tags: ["Group Project", "Futures Concept"],
    info: {
      timeline: "March - June 2026",
      role: "Art Director, Concept Lead",
      team: [
        "Ryan Pham (me!)",
        "Jasleen Sandhu",
        "Deeksha Raj"
      ],
      disciplines: ["Speculative Design", "Non-Screen Interaction Technology Design", "Futures Thinking", "Conceptual Design", "Agentic AI Design"]
    },
    gallery: [
      "/images/aip/image 118.png",
      "/images/aip/image 119.png",
      "/images/aip/image 120.png"
    ],
    blocks: [
      {
        type: "text",
        label: "ABSTRACT",
        content: "This project follows the entertainment and cultural experience problem space through three stages of design - moving from speculation to a working prototype. It began with futures thinking, forecasting a 2036 where AI becomes a creative equaliser for marginalised voices, then created a window to that future with an Artefact. That preferred future shaped three conceptual design proposals tackling three different non-screen interaction technologies, from which an AR storytelling overlay emerged as the strongest direction. The final stage translated this thinking into Sage, an agentic AI chatbot prototype that helps creatives learn the tools of their trade - closing the loop from imagined future, to design concept, to something a real user could actually use."
      },
      {
        type: "images",
        label: "PART 1: FUTURES THINKING",
        items: [
          { src: "/images/creative-futures/ft1.png" },
          { src: "/images/creative-futures/ft2.png" },
          { src: "/images/creative-futures/ft3.png" },
          { src: "/images/creative-futures/ft4.png" },
          { src: "/images/creative-futures/ft5.png" },
          { src: "/images/creative-futures/ft6.png" },
        ]
      },
      {
        type: "text",
        content: "## Drivers\n\nMapped the forces reshaping how culture is made and shared: the rise of AI as a production tool, growing corporate control over cultural distribution, declining public arts funding, shifting attention economies, and a global shift toward entertainment accessibility.\n\n## Forecasting\n\nThese drivers were combined into four future forecasts; including the Curated Human Art Movement, the Cultural Graveyard, and Experience as Currency, with AI as a Creative Equaliser selected as the preferred future: a 2036 where AI gives marginalised and underrepresented communities the tools to produce, distribute, and amplify stories mainstream platforms would never greenlight.\n\n## Scenario & Artefact\n\nRather than only building toward the preferred future, the team also interrogated its risks. Forecast 1 was extended into a scenario, The Human Arts Certification Authority, following an artist navigating a body meant to protect human creativity that calcifies into its own form of gatekeeping. This became the Artefact from the Future: a sterile, bureaucratic rejection letter from the fictional Cultural Integrity Council of Australia, deliberately soulless in its design, a future to avoid, not aspire to.\n\n"
      },
      {
        type: "images",
        label: "PART 2: CONCEPTUAL DESIGN",
        items: [
          { src: "/images/creative-futures/cd1.png" },
          { src: "/images/creative-futures/cd2.png" },
          { src: "/images/creative-futures/cd3.png" },
          { src: "/images/creative-futures/cd4.png" },
          { src: "/images/creative-futures/cd5.png" }
        ]
      },
      {
        type: "text",
        content: "## How Might We\n\nThe preferred future was translated into three HMW questions, each targeting a different barrier to marginalised storytelling reaching global audiences: gaining recognition amid AI-saturated media, ensuring platforms amplify authentic rather than commercially sanitised stories, and increasing access to storytelling tools for minority and rural communities.\n\n## Three Proposals\n\nEach HMW question was developed into a distinct non-screen interaction concept:\n\nService Design: a Creator Mentorship Matching Service connecting storytellers from marginalised communities with filmmaker mentors, building skills and confidence through hands-on production experience.\nExtended Reality: an AR Cultural Connection Overlay letting users encounter authentic cultural stories overlaid on the real world or projected into their own homes, with content fully owned and controlled by originating communities.\nSmart Device/Environment: an Autonomous Mobile Creative Studio, a self-driving vehicle that delivers a fully equipped production space directly to remote and under-resourced communities.\n\n## Feedback & Critical Analysis\n\nEach proposal was presented to peers and walked through to surface limitations. The mentorship service was found to build capacity but not solve visibility at scale; the autonomous studio was constrained by geography and reliance on funding; the AR overlay's main limitation was its dependence on communities actively contributing stories to populate the platform.\n\n## Selection\n\nThe AR Cultural Connection Overlay was selected as the preferred proposal. It was the only concept that solved distribution at scale while keeping communities in control of their own narratives, and it was grounded in real-world precedent (the Indigital app). Rather than treating the other two as failures, the team reframed all three as stages of one creative pipeline; the mobile studio enabling production, the mentorship service building skill and confidence, and the AR platform amplifying the resulting stories to a global audience.\n\n"
      },
      {
        type: "video",
        label: "PART 3: REFINED PROTOTYPE",
        src: "https://youtu.be/vxpUEjoYJGk",
        caption: "Example of the SAGE AI chatbot"
      },
      {
        type: "text",
        content: "## Ideation\n\nThe final stage shifted from the cultural distribution pipeline to a more practical question facing creatives day-to-day: how do they actually learn the tools of their trade? Three candidate chatbot concepts were developed before settling on a Learning Management System-style agent.\n\n## Design & Build\n\nThe result was Sage, an agentic AI chatbot built in Voiceflow, structured across five playbooks that work together to:\n\n- Assess a user's existing knowledge and learning style\n- Recommend the right creative software for their field, project, and skill level\n- Build a personalised, evolving learning roadmap with curated resources\n- Detect confusion and adapt its explanation style accordingly\n\n## Testing & Refinement\n\n- The chatbot was tested with realistic and ambiguous inputs to refine routing between playbooks, then presented at a design crit for feedback on its handling of errors, edge cases, and out-of-scope requests before finalisation.\n- Sage answers the question of how to make industry-relevant education adaptive and accessible, meeting creatives, from entry-level to seasoned professionals, wherever they are."
      },
      {
        type: "text",
        label: "REFLECTION",
        content: "## Individual Contribution\n\nFor the group project, I took on the role of a visual director and a leader in some aspects. At the start of each of the group assignments, I was in charge of breaking down the tasks that needed to be done and setting a timeline for completion.\n\nI had also introduced collaborative frameworks that resulted in a fair selection of ideas. For example, affinity mapping after an rapid ideation session, and then narrowing down on results via voting for our favourites. This rigid-sounding structure was still open for debate, such that team members could voice their opinion if the resultant idea didn’t align with the project guidelines or if there was a better idea.\n\nDuring our team meetings, I also raised task completion, checking in on our progress to encourage the team to meet the deadline. I also worked to ensure that everyone’s ideas were heard, amalgamated and refined to produce an end result that we could equally share.\n\nFor the slides themselves, I was the visual director. I had implemented a cohesive design system for each slide deck that included fonts, colours, creative direction. I also produced the visuals for the slide decks as well, matching them to the theme of the presentation whilst ensuring aesthetic quality.\n\nOverall, we had a fair distribution of the work itself. Each member collaborated to ideas, analysis, and writing up the slide deck. I had recorded the content for the video and edited it together. I was also in charge of the final editing and revising, in which I ensured cohesiveness and checked for spelling, grammatical and logical flaws.\n\n## The Use of AI in UX\n\nThe use of AI in iterative prototyping and UX is one that should be carefully considered. Throughout this subject, I had the experience of playing around with AI in the different areas of UX, as well as had an insight into how AI is evolving, and the future it might have on the profession.\n\nWith regards to conversational AI, I believe that there are many benefits and advantages to its use, however, it should be considered and intentional.\n\nIn the first group assignment, we had the daunting task of mapping the Entertainment and Cultural Experience problem space. After we had collectively exhausted our ideas of what constituted that space, we turned to generative AI tools in order to help us expand our breadth of knowledge and explore other facets of the space. In this case, AI was a supplementary tool that helped us to figure out what we didn’t know.\n\nIn terms of doing research like this, I think that AI is very valuable. We had centred our knowledge before inviting a LLM to contribute what it knows. This allowed for something original and ours, with the enhancement of an artificial intelligence. I find the balance to be broken when no human thought or experience is accounted for before AI is introduced into the equation. If the work is purely AI, what is the value the human is bringing. UX is grounded in the consideration of another’s experience. If the AI is doing all the considering, then the human is not doing the UX.\n\nI also had the chance to experiment with AI tools such as Google Stitch and Figma Make, which can generate full interfaces from prompts. These tools enabled a rapid prototyping experience. I found that the prototypes that came out of the tools were rudimentary and uninspired. Perhaps it was a limitation of the model or of the prompts, but there was a quality about it that read as “AI-generated”. I think that these platforms offer a jumping off point, from where the user can refine the product further.\n\nWhether I agree with AI in the UX space or not, I must admit that it seems to be inevitable. With that change, UX professionals must prepare to shift their skillsets as well. It is no longer enough to know how to craft a product. We must learn to adapt by reframing our usefulness and purpose in this cut-throat industry. As it has been taught in this subject, we must focus on broader ideas such as systems thinking, judgement, and responsibility. It is only then that we can hold onto that core tenet of UX; a care for the user.\n\n## What I learned from this project\n\nThroughout the course of this subject. I have begun to look beyond the surface. I have challenged myself to keep digging deeper, to explore more and to question more. It has also strengthened my skill in visual communication design.\n\nThrough the exploration of units such as systems thinking, SDG impacts, and the preferred future, I have learnt about the broader world the technologies we design reside in. How they fit into the world? How they are influenced by the systems that make up the world? How they might shape a potential future?\n\nThe units exploring novel non-screen based interactions and agentic AI exposed me to a new idea of what design is. It really showed me how I can transfer the skills from traditional interface design to something more abstract. This experience has shown me how design at its core is a framework. Once you have grasped the thinking around it, you can apply it anything around you.\n\nI will take these teachings and continue to enquire about the world around me as it shifts and rapidly evolves. I think through that collaborative, iterative exploration, that we can find the answer to what UX means, and how we fit into the broader world, even through change and uncertainty. I will also look for industry experience to understand on a daily basis what is changing, and how I can stay on top of it all."
      }
    ]
  },

  {
    id: "starchitect",
    title: "Starchitect",
    eyebrow: "Cybernetic Futures 2026",
    date: "May 2026",
    tags: ["Uni Project", "Game Design"],
    info: {
      timeline: "May 2026",
      role: "Board Layout, Rulebook, Reference Cards",
      team: ["Ryan Pham", "Sam Lee", "Priya Nair"],
      disciplines: ["Game Design", "Print Design"]
    },
    gallery: [],
    // LEVEL 1 EXAMPLE — theme override.
    // This window gets a deep-space palette instead of the site default,
    // scoped only to this window. Nothing else changes.
    theme: {
      accent: "#c9a14a",
      bg: "rgba(20,18,28,0.82)",
      bgSolid: "#15131c",
      border: "rgba(255,255,255,0.12)",
      text: "#ece8f0",
      textDim: "#a39bb0",
      titlebarBg: "rgba(30,27,40,0.6)"
    },
    blocks: [
      {
        type: "text",
        label: "Overview",
        content:
          "A physical constellation-building board game built for the Cybernetic Futures showcase, featuring a laser-cut board and 3D-printed components. I led the segmented board layout concept, wrote the rulebook, designed the reference cards, and planned the live demo."
      }
    ]
  },

  {
    id: "roam",
    title: "Roam — walk route planner",
    eyebrow: "Personal Project",
    date: "2025",
    tags: ["Web App", "Maps"],
    gallery: [],
    // LEVEL 2 EXAMPLE — windowClass override.
    // Adds a custom class so a blueprint-style grid background and
    // monospace titlebar can be defined in project-overrides.css,
    // which theme variables alone couldn't achieve.
    windowClass: "pw-window-blueprint",
    blocks: [
      {
        type: "text",
        label: "Overview",
        content:
          "A walk route planner built with the Overpass API, OSRM, Nominatim, and Google Maps — styled here like a routing schematic rather than the usual editorial layout, since the project itself is about paths and networks."
      },
      {
        type: "video",
        label: "Demo walkthrough",
        src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        caption: "A quick screen recording of the route planner in action."
      }
    ]
  },

  {
    id: "about-me-custom",
    title: "About Ryan",
    eyebrow: "",
    date: "",
    tags: [],
    // LEVEL 3 EXAMPLE — customHTML override.
    // Completely bespoke layout; the engine ignores eyebrow/date/tags/
    // gallery/blocks entirely and renders this markup as-is inside the
    // window body. Window chrome (drag/resize/close) still works.
    customHTML: `
      <div style="display:flex; gap:24px; align-items:flex-start;">
        <img src="/assets/me/headshot.jpg" alt="Ryan Pham"
             style="width:140px; height:140px; border-radius:50%; object-fit:cover; flex-shrink:0;">
        <div>
          <h1 class="pw-h1" style="margin-top:0;">Hey, I'm Ryan</h1>
          <p class="pw-block-text">
            A custom two-column layout, written directly in HTML instead of
            the standard block system — useful for a one-off page like an
            About panel where the default template doesn't quite fit.
          </p>
        </div>
      </div>
    `
  },

      {
    id: "unimelb-library-website-usability-study",
    title: "UniMelb Library Website Usability Study",
    eyebrow: "UX Research",
    date: "October 2025",
    links: [
      { label: "Read the report", url: "https://docs.google.com/document/d/1O9H9ZfIFuetLsXoGjn0KF3himYEe2KTfq85eh5FhPYw/edit?usp=sharing" },
      { label: "View report video", url: "https://www.youtube.com/watch?v=sy_EGIsYE4o" }
    ],
    tags: ["Usability Evaluation", "Group Project"],
    info: {
      timeline: "Sep - Oct 2025",
      role: "UX Researcher",
      team: [
        "Ryan Pham (me!)",
        "Phoebe Biggin",
        "Jasleen Sandhu",
        "Matthew O'Connell"
      ],
      disciplines: ["UX Research", "Usability Testing", "Eye-tracking", "Heuristic Evaluation", "Cognitive Walkthrough"]
    },
    gallery: [],
    blocks: [
      {
        type: "video",
        label: "Report Video",
        src: "https://www.youtube.com/watch?v=sy_EGIsYE4o"
      },
      {
        type: "text",
        label: "ABSTRACT",
        content: "Conducted a comprehensive usability evaluation of the University of Melbourne Library website as part of a four-person UX research team. The project combined moderated usability testing, eye-tracking analysis, think-aloud protocols, System Usability Scale (SUS) surveys, closed card sorting, and five-second tests to evaluate how students navigated the library's digital services.\n\nAcross 17 participants, we identified critical usability issues affecting navigation, information architecture, terminology, search functionality, and visual hierarchy. By synthesising both qualitative observations and quantitative metrics through affinity mapping and thematic analysis, we produced evidence-based recommendations to improve task efficiency, reduce cognitive load, and create a more intuitive user experience.\n\nThis project strengthened my experience in end-to-end UX research, including study design, participant testing, mixed-method data analysis, usability reporting, and translating research findings into actionable design recommendations backed by user evidence."
      },
      {
        type: "images",
        items: [
          { src: "/images/unimelb-library/img1.png", caption: "Note-taking during user testing" },
          { src: "/images/unimelb-library/img2.png", caption: "Making observations on participant's comments" },
          { src: "/images/unimelb-library/img3.png", caption: "Analysing eye-tracking data and tasks completion metrics" }
        ]
      }
    ]
  },
      {
    id: "sweet-mayada-cakes-redesign",
    title: "Sweet Mayada Cakes Redesign",
    eyebrow: "Product Design",
    date: "June 2025",
    links: [
      { label: "View live prototype", url: "https://pookiesaurus.github.io/info20005-a3/" },
      { label: "View Figma prototype", url: "https://www.figma.com/proto/wPL2YvLErO41F7xRiHCuaW/Assignment-2-RYAN-PHAM?page-id=0%3A1&node-id=1-4&p=f&viewport=483%2C124%2C0.11&t=Vf7VE7dSpmrKpA0M-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=1%3A4&show-proto-sidebar=1" },
      { label: "Read prototype report", url: "https://www.figma.com/deck/pPWPi3QyGwb8RsxgXRmvPn/Assignment-2-Report-Ryan-Pham?node-id=1-42&t=gA32RVOSqP7dD10M-1" },
      { label: "Read implementation report", url: "https://www.figma.com/deck/xcKbgQS9Rm43qqeb9TXfLJ/Assignment-3-Report---Ryan-Pham?node-id=1-42&t=RIye5mPuI8UbXX61-1" }
    ],
    tags: ["Product Design", "Uni Project"],
    info: {
      timeline: "Apr - June 2025",
      role: "Product Designer",
      disciplines: ["Figma prototyping", "Low fidelity prototyping", "High fidelity prototyping", "Product Design"]
    },
    gallery: [],
    blocks: [
      {
        type: "images",
        items: [
          { src: "/images/sweetmayadacakes/og.png", caption: "Original design" },
          { src: "/images/sweetmayadathumbnail.png", caption: "Redesigned home page" },
          { src: "/images/sweetmayadacakes/products.png", caption: "Redesigned product list" }
        ]
      },
      {
        type: "text",
        label: "ABSTRACT",
        content: "This project involved the end-to-end redesign and development of the Sweet Mayada Cakes website, with the goal of creating a modern, responsive digital experience that better reflected the brand while improving usability and engagement. Rather than focusing solely on the final product, the project explored the complete UX and UI design process, from early research through to implementation and critical evaluation.\n\nThe design process began with developing mood boards and gathering visual inspiration to establish the brand's identity and tone. Multiple art directions were explored before selecting the strongest visual language, informed by critical comparison and reflection. This foundation guided the creation of sketches, low-fidelity wireframes, and high-fidelity prototypes, alongside careful consideration of typography, colour palettes, spacing, layout systems, and interaction design to produce a cohesive and accessible interface.\n\nThe final website was developed using HTML, CSS, and JavaScript, translating the design system into a responsive, production-ready website with interactive components and a consistent experience across desktop and mobile devices. Throughout the project, design decisions were continuously evaluated through critical analysis, ensuring that aesthetic choices also supported usability, accessibility, and the business's goals.\n\nThis project marked a significant milestone in my development as a designer. It expanded my perspective beyond simply creating attractive interfaces, teaching me to consider every aspect of product and interface design - from brand identity and visual systems to user needs, accessibility, information hierarchy, and implementation. More importantly, it reinforced the value of iteration, critical reflection, and evidence-based decision-making, giving me a much deeper understanding of how thoughtful design choices contribute to meaningful user experiences."
      }
    ]
  },
    {
    id: "ai-portfolio-builder-prototype",
    title: "AI Portfolio Builder Prototype",
    eyebrow: "Product Design",
    date: "November 2024",
    links: [
      { label: "View live prototype", url: "https://www.figma.com/proto/QNDITRtsATW1iuQ1NETLIM/Prototype---Working-Draft?page-id=0%3A1&node-id=110-580&viewport=3067%2C682%2C0.4&t=hdwk2bk7kJv6bODh-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=110%3A580&show-proto-sidebar=1" },
      { label: "Read user research report", url: "https://docs.google.com/document/d/1b3TCk8ejWje5vmFLATLy0OfOrn3f4Uko/edit?usp=sharing&ouid=114976375432775018213&rtpof=true&sd=true" },
      { label: "Read project report", url: "https://docs.google.com/document/d/1l9PbZkHCwyhsjkj5GqZBS1okiPDnu3lr/edit?usp=sharing&ouid=114976375432775018213&rtpof=true&sd=true" },
      { label: "View project video", url: "https://youtu.be/CewrQMYpqLo" }
    ],
    tags: ["Group Project", "Prototyping"],
    info: {
      timeline: "Aug - Nov 2024",
      role: "Product Designer",
      team: [
        "Ryan Pham (me!)",
        "Phoebe Biggin",
        "Jasleen Sandhu",
        "Matthew O'Connell",
        "Lisa-Marie Muvirimi"
      ],
      disciplines: ["UI/UX Design", "User Research", "Interviewing", "Thematic Analysis", "Personas", "Figma Prototyping", "Paper Prototyping"]
    },
    gallery: [
      "/images/airesume/img1.png",
      "/images/airesume/img2.png",
      "/images/airesume/img3.png",
      "/images/airesume/img4.png"
    ],
    blocks: [
      {
        type: "video",
        src: "https://youtu.be/CewrQMYpqLo"
      },
      {
        type: "text",
        label: "ABSTRACT",
        content: "A prototype for an AI resume/portfolio builder. An initial report featuring the results of interviews, thematic analysis and personas is included as part of the design process. The final prototype is accompanied with a report and a video presentation detailing the design process, user testing results, and future improvements. \n\nOutside of general group work, I was responsible for prototyping the home page and the user onboarding process, as well as general revisions for cohesion."
      }
    ]
  }
];
