/* eslint-disable no-console */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { supabase } = require('../src/lib/supabase');
const { stringifyJson } = require('../src/lib/supabase');

const FORCE = process.argv.includes('--force');

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 180);
}

async function main() {
  console.log('[seed] Checking database...');
  const probe = await supabase.from('profiles').select('id', { count: 'exact', head: true });
  if (probe.error && probe.error.code === '42P01') {
    console.error('[seed] Tables missing. Run server/db/schema.sql in the Supabase SQL editor first, then npm run setup && npm run seed');
    process.exit(1);
  }
  if (probe.error) {
    console.error('[seed] Supabase connection error:', probe.error.message);
    process.exit(1);
  }

  if ((probe.count || 0) > 0 && !FORCE) {
    console.log('[seed] Content already exists. Re-run with "npm run seed -- --force" to wipe and reseed demo data.');
    process.exit(0);
  }

  if (FORCE) {
    console.log('[seed] --force: clearing content tables...');
    const tables = [
      'biographies', 'profile_contacts', 'profile_social_links', 'research_areas',
      'academic_appointments', 'academic_positions', 'non_academic_positions', 'education',
      'research_outputs', 'funded_research', 'teaching', 'supervision', 'service_leadership',
      'professional_memberships', 'organizational_memberships', 'awards', 'media',
      'contact_messages', 'audit_logs', 'profiles'
    ];
    for (const table of tables) {
      await supabase.from(table).delete().neq('id', 0);
    }
  }

  const insert = async (table, value, opts = {}) => {
    const q = supabase.from(table).insert(value);
    const r = opts.single ? await q.select().single() : await q.select();
    if (r.error) throw new Error(`Insert failed into ${table}: ${r.error.message}`);
    return opts.single ? r.data : r.data[0];
  };

  console.log('[seed] Creating administrator accounts...');
  const adminHash = await bcrypt.hash('password', 10);
  for (const account of [
    { name: 'Site Administrator', email: 'admin@asmare.test', role: 'admin' },
    { name: 'Profile Owner', email: 'owner@asmare.test', role: 'owner' },
    { name: 'Content Editor', email: 'editor@asmare.test', role: 'editor' }
  ]) {
    const { data: existing } = await supabase.from('users').select('id').eq('email', account.email).limit(1);
    if (existing && existing[0]) {
      await supabase.from('users').update({ password_hash: adminHash, is_active: true }).eq('id', existing[0].id);
    } else {
      await insert('users', { ...account, password_hash: adminHash, is_active: true }, { single: true });
    }
  }

  const profile = await insert('profiles', {
    profile_type: 'Academic',
    username: 'asmare-berhane',
    honorific: 'Prof.',
    full_name: 'Asmare Berhane',
    current_position: 'Director, Institute of Intelligent Systems & Robotics',
    organizational_unit: 'Institute of Intelligent Systems & Robotics',
    institution: 'Faculty of Engineering and Technology',
    city: 'Asmara',
    country: 'Eritrea',
    orcid_id: '0000-0002-1825-0097',
    orcid_url: 'https://orcid.org/0000-0002-1825-0097',
    orcid_verified: true,
    supervision_availability: 'Available for Masters Research and PhD student supervision.',
    visibility: 'published',
    published_at: new Date().toISOString()
  }, { single: true });

  await insert('biographies', {
    profile_id: profile.id,
    bio_title: 'About',
    short_bio: 'Professor of Intelligent Systems with research focus on field robotics, information fusion and applied artificial intelligence.',
    bio_content:
      '<p>Prof. Asmare Berhane is a professor and research director whose work spans <strong>field robotics</strong>, <strong>information extraction and fusion</strong>, and <strong>applied artificial intelligence</strong>. Over the past two decades his research has moved from laboratory prototypes into deployments for mining, agriculture and public infrastructure inspection.</p>' +
      '<p>As Director of the Institute of Intelligent Systems &amp; Robotics, he leads a multidisciplinary team of researchers, engineers and graduate students. He has served as principal and co-investigator on funded research projects supported by national science agencies, industry partners and international collaborations.</p>' +
      '<p>His teaching spans robotics, artificial intelligence, mechatronics and software engineering, and he has supervised numerous postgraduate research candidates through to completion. His professional contributions include editorial service, conference leadership and advisory roles in national engineering bodies, and he has received recognition for both research excellence and teaching quality.</p>',
    visibility: 'published'
  });

  const contactTypes = [
    ['work_phone', '+291 7 123 456'],
    ['email', 'asmare.berhane@university.edu.et'],
    ['office', 'Room 214, Engineering Building'],
    ['faculty', 'Faculty of Engineering and Technology'],
    ['institution', 'National Institute of Science and Technology'],
    ['city', 'Asmara'],
    ['country', 'Eritrea']
  ];
  for (const [i, [type, value]] of contactTypes.entries()) {
    await insert('profile_contacts', { profile_id: profile.id, type, value, visibility: 'public', display_order: i });
  }

  const socialLinks = [
    ['orcid', 'ORCID', 'https://orcid.org/0000-0002-1825-0097'],
    ['google_scholar', 'Google Scholar', 'https://scholar.google.com/citations?user=example'],
    ['linkedin', 'LinkedIn', 'https://www.linkedin.com/in/example'],
    ['researchgate', 'ResearchGate', 'https://www.researchgate.net/profile/example'],
    ['personal_website', 'Personal Website', 'https://example.edu/profile']
  ];
  for (const [i, [platform, label, url]] of socialLinks.entries()) {
    await insert('profile_social_links', { profile_id: profile.id, platform, label, url, display_order: i, is_active: true });
  }

  const areaNames = {};

  for (const [i, a] of [
    ['Field Robotics', 'Autonomous and tele-operated systems operating in unstructured outdoor environments.', 'robot'],
    ['Intelligent Robotics', 'Perception, planning and control for adaptive robotic behaviour.', 'brain'],
    ['Information Extraction and Fusion', 'Combining heterogeneous sensor streams into reliable situational models.', 'database'],
    ['Artificial Intelligence', 'Machine learning and knowledge representation for engineering applications.', 'cpu']
  ].entries()) {
    const area = await insert('research_areas', { profile_id: profile.id, name: a[0], slug: slugify(a[0]), description: a[1], icon: a[2], display_order: i, visibility: 'published' }, { single: true });
    areaNames[a[0]] = area.id;
  }

  for (const [i, row] of [
    ['Director', 'Professor', null, 'Institute of Intelligent Systems & Robotics', '2022', null, true],
    ['Professor, Deputy Director', 'Professor', 'Faculty of Engineering and Technology', 'National Institute of Science and Technology', '2019', null, true],
    ['Associate Professor, Course Coordinator', 'Associate Professor', 'Faculty of Engineering and Technology', 'National Institute of Science and Technology', '2014', '2019', false],
    ['Senior Lecturer', 'Senior Lecturer', 'Faculty of Engineering and Technology', 'National Institute of Science and Technology', '2009', '2014', false]
  ].entries()) {
    await insert('academic_appointments', {
      profile_id: profile.id, job_title: row[0], academic_rank: row[1], faculty: row[2],
      organization: row[3], start_date: row[4], end_date: row[5], is_current: row[6],
      display_order: i, visibility: 'published'
    });
  }

  await insert('academic_positions', {
    profile_id: profile.id, position: 'Visiting Professor', institution: 'Addis Ababa Institute of Technology',
    country: 'Ethiopia', start_date: '2018', end_date: '2018', display_order: 0, visibility: 'published'
  });

  await insert('non_academic_positions', {
    profile_id: profile.id, job_title: 'Design and Sales Engineer', company: 'East Africa Industrial Systems Ltd.',
    industry: 'Industrial Automation', location: 'Nairobi', country: 'Kenya', start_date: '1995', end_date: '1998',
    description: 'Industrial control system design, commissioning and client training for manufacturing clients.',
    display_order: 0, visibility: 'published'
  });

  for (const [i, row] of [
    ['PhD', 'Mechanical and Electrical Engineering', 'Nanyang Technological University', 'Singapore', 'Singapore', '2004', 'Intelligent perception systems for autonomous field vehicles', 'Thesis focused on multi-sensor perception for autonomous navigation in unstructured terrain.'],
    ['M.Eng', 'Mechatronics', 'Nanyang Technological University', 'Singapore', 'Singapore', '2000', null, null],
    ['BSc.Eng (Hons)', 'Electrical Engineering', 'National Institute of Science and Technology', 'Asmara', 'Eritrea', '1995', null, null]
  ].entries()) {
    await insert('education', {
      profile_id: profile.id, degree: row[0], field_of_study: row[1], institution: row[2],
      location: row[3], country: row[4], completion_date: row[5], thesis_title: row[6], description: row[7],
      display_order: i, visibility: 'published'
    });
  }

  const outputs = [
    {
      title: 'Adaptive perception for autonomous field robots in unstructured terrain', type: 'journal',
      journal: 'Journal of Field Robotics', volume: '40', issue: '3', pages: '512-538', year: 2023,
      publication_date: '2023-05-01', doi: '10.1002/jfr.2214', authors: ['A. Berhane', 'M. Tesfai', 'L. Kassa'],
      keywords: ['field robotics', 'perception', 'sensor fusion'], area: 'Field Robotics', featured: true,
      abstract: 'This paper presents an adaptive perception framework that enables autonomous field robots to maintain reliable situational awareness across changing terrain and lighting conditions. We evaluate the approach on real-world outdoor datasets and demonstrate improvements in obstacle classification accuracy.'
    },
    {
      title: 'Multi-sensor information fusion for autonomous mining vehicles', type: 'journal',
      journal: 'Autonomous Robots', volume: '37', issue: '2', pages: '189-205', year: 2022,
      publication_date: '2022-08-01', doi: '10.1007/s10514-022-09280-1', authors: ['A. Berhane', 'J. Okubai'],
      keywords: ['information fusion', 'mining', 'autonomy'], area: 'Information Extraction and Fusion', featured: true,
      abstract: 'We describe a fusion architecture combining lidar, radar and inertial sensing for mobile mining equipment operating in GPS-denied environments.'
    },
    {
      title: 'Deep learning for visual inspection of civil infrastructure', type: 'conference',
      conference: 'IEEE International Conference on Robotics and Automation', pages: '1104-1111', year: 2021,
      publication_date: '2021-06-01', doi: '10.1109/ICRA48506.2021', authors: ['A. Berhane', 'H. Abebe', 'T. Solomon'],
      keywords: ['deep learning', 'inspection', 'computer vision'], area: 'Artificial Intelligence', featured: false,
      abstract: 'A convolutional pipeline for automated detection of surface defects in concrete infrastructure using limited labelled data.'
    },
    {
      title: 'Planning under uncertainty for off-road robotic navigation', type: 'conference',
      conference: 'International Conference on Intelligent Robots and Systems', pages: '77-84', year: 2020,
      publication_date: '2020-10-01', authors: ['A. Berhane', 'M. Tesfai'],
      keywords: ['motion planning', 'uncertainty', 'navigation'], area: 'Intelligent Robotics', featured: false
    },
    {
      title: 'Knowledge-driven information extraction from engineering reports', type: 'journal',
      journal: 'Engineering Applications of Artificial Intelligence', volume: '98', pages: '104-119', year: 2021,
      publication_date: '2021-03-01', doi: '10.1016/j.engappai.2021.104119', authors: ['A. Berhane', 'R. Kifle'],
      keywords: ['information extraction', 'NLP', 'knowledge graphs'], area: 'Artificial Intelligence', featured: false
    },
    {
      title: 'Soil-aware path planning for agricultural robots', type: 'chapter',
      publisher: 'Springer Tracts in Advanced Robotics', pages: '201-224', year: 2019, authors: ['A. Berhane'],
      keywords: ['agriculture', 'path planning'], area: 'Field Robotics', featured: false
    },
    {
      title: 'System and method for terrain-adaptive robotic locomotion control', type: 'patent',
      publisher: 'National Patent Office', year: 2018, authors: ['A. Berhane', 'P. Haile'],
      keywords: ['patent', 'locomotion'], area: 'Intelligent Robotics', featured: false
    },
    {
      title: 'Robotics middleware toolkit for research and education', type: 'software',
      publisher: 'GitHub', year: 2023, url: 'https://github.com/example/robotics-middleware', authors: ['A. Berhane', 'H. Abebe'],
      keywords: ['software', 'open source'], area: 'Intelligent Robotics', featured: false
    }
  ];

  for (const o of outputs) {
    const record = {
      profile_id: profile.id, title: o.title, slug: slugify(o.title), publication_type: o.type,
      authors: stringifyJson(o.authors || []), keywords: stringifyJson(o.keywords || []),
      journal: o.journal || null, conference: o.conference || null, publisher: o.publisher || null,
      volume: o.volume || null, issue: o.issue || null, pages: o.pages || null, year: o.year || null,
      publication_date: o.publication_date || null, doi: o.doi || null, url: o.url || null,
      abstract: o.abstract || null, research_area_id: areaNames[o.area] || null, featured: o.featured || false,
      visibility: 'published', citation: null, isbn: null, issn: null, pdf_url: null, external_url: null, repository_url: null
    };
    await insert('research_outputs', record);
  }

  const projects = [
    {
      title: 'Autonomous field inspection robotics for critical infrastructure', funding_type: 'Grant',
      funder: 'National Science Foundation', funding_scheme: 'Collaborative Research Grant', grant_number: 'NSF-2022-1044',
      amount: 425000, currency: 'USD', start_date: '2022-01-01', end_date: '2025-12-31', status: 'Active', project_type: 'Applied research',
      description: 'A four-year programme developing autonomous robotic platforms for inspection of bridges, tunnels and water infrastructure, integrating perception, planning and human-robot collaboration.',
      people: [
        { name: 'A. Berhane', role: 'Principal Investigator' }, { name: 'M. Tesfai', role: 'Co-Investigator' },
        { name: 'H. Abebe', role: 'Researcher' }, { name: 'T. Solomon', role: 'Student' }
      ],
      keywords: ['robotics', 'infrastructure', 'autonomy'], featured: true
    },
    {
      title: 'Sensor fusion platform for precision agriculture', funding_type: 'Industry Funding',
      funder: 'AgriTech Industries', funding_scheme: 'Industry Research Contract', grant_number: 'AT-2021-88',
      amount: 180000, currency: 'USD', start_date: '2021-06-01', end_date: '2023-05-31', status: 'Completed', project_type: 'Contract research',
      description: 'Development and field evaluation of a multi-sensor fusion platform for autonomous agricultural equipment operating in variable soil and light conditions.',
      people: [
        { name: 'A. Berhane', role: 'Principal Investigator' }, { name: 'R. Kifle', role: 'Researcher' },
        { name: 'L. Kassa', role: 'Student' }
      ],
      keywords: ['agriculture', 'sensor fusion'], featured: true
    },
    {
      title: 'Intelligent information extraction for engineering knowledge bases', funding_type: 'Government Funding',
      funder: 'Ministry of Education', funding_scheme: 'Postgraduate Training Programme', grant_number: 'MOE-2019-55',
      amount: 95000, currency: 'USD', start_date: '2019-09-01', end_date: '2022-08-31', status: 'Completed', project_type: 'Basic research',
      description: 'A research programme combining natural language processing and knowledge representation to extract structured engineering knowledge from technical reports.',
      people: [{ name: 'A. Berhane', role: 'Principal Investigator' }, { name: 'J. Okubai', role: 'Researcher' }],
      keywords: ['NLP', 'knowledge graphs'], featured: false
    },
    {
      title: 'Robotics and AI curriculum development for East African universities', funding_type: 'University Funding',
      funder: 'Inter-University Council', funding_scheme: 'Curriculum Innovation Fund', grant_number: 'IUC-2023-12',
      amount: 60000, currency: 'USD', start_date: '2023-03-01', end_date: '2024-12-31', status: 'Active', project_type: 'Education project',
      description: 'Curriculum design and laboratory development for undergraduate and postgraduate robotics and artificial intelligence programmes across partner universities.',
      people: [{ name: 'A. Berhane', role: 'Co-Investigator' }, { name: 'H. Abebe', role: 'Researcher' }],
      keywords: ['education', 'curriculum'], featured: false
    }
  ];

  for (const p of projects) {
    await insert('funded_research', {
      profile_id: profile.id, title: p.title, slug: slugify(p.title), project_type: p.project_type,
      funding_type: p.funding_type, funder: p.funder, funding_scheme: p.funding_scheme, grant_number: p.grant_number,
      amount: p.amount, currency: p.currency, start_date: p.start_date, end_date: p.end_date, status: p.status,
      description: p.description, people: stringifyJson(p.people), keywords: stringifyJson(p.keywords),
      project_url: null, featured: p.featured, visibility: 'published'
    });
  }

  const courses = [
    ['Introduction to Robotics', 'ROB301', 'Undergraduate', 'Semester 1', '2024', 'Kinematics, sensing, actuators and control fundamentals with laboratory work.'],
    ['Artificial Intelligence', 'CS412', 'Undergraduate', 'Semester 2', '2024', 'Search, knowledge representation, machine learning and applications.'],
    ['Advanced Information Fusion', 'ROB705', 'Postgraduate', 'Semester 1', '2023', 'Bayesian and deep fusion methods for multi-sensor systems.'],
    ['Mechatronic Systems Design', 'MEC410', 'Undergraduate', 'Semester 2', '2023', 'Integrated design of mechanical, electronic and control subsystems.'],
    ['Software Engineering', 'CS305', 'Undergraduate', 'Semester 1', '2022', 'Requirements, design, testing and team-based project delivery.']
  ];
  for (const [i, c] of courses.entries()) {
    await insert('teaching', {
      profile_id: profile.id, course_name: c[0], course_code: c[1], level: c[2], semester: c[3],
      year: c[4], description: c[5], institution: 'National Institute of Science and Technology',
      display_order: i, visibility: 'published'
    });
  }

  const students = [
    ['M. Tesfai', 'PhD', 'Resilient perception for field robots in adverse conditions', '2021', null, 'current', 'Dr. R. Kifle'],
    ['H. Abebe', 'PhD', 'Deep learning methods for infrastructure inspection', '2020', null, 'current', null],
    ['T. Solomon', 'Masters', 'Motion planning for agricultural robots', '2022', null, 'current', null],
    ['L. Kassa', 'Masters', 'Multi-sensor calibration for autonomous platforms', '2018', '2020', 'completed', null],
    ['J. Okubai', 'PhD', 'Information fusion architectures for autonomous systems', '2016', '2020', 'completed', null]
  ];
  for (const [i, s] of students.entries()) {
    await insert('supervision', {
      profile_id: profile.id, student_name: s[0], degree: s[1], research_topic: s[2],
      start_date: s[3], completion_date: s[4], status: s[5], co_supervisors: s[6],
      display_order: i, visibility: 'published'
    });
  }

  const service = [
    ['Director', 'Institute of Intelligent Systems & Robotics', 'leadership', '2022', null, true, 'Strategic leadership of the institute including research strategy, staffing and industry partnerships.'],
    ['Associate Editor', 'Journal of Field Robotics', 'editorial', '2020', null, true, null],
    ['Program Committee Member', 'IEEE International Conference on Robotics and Automation', 'conference', '2019', null, true, null],
    ['Member, National Engineering Accreditation Board', 'Ministry of Education', 'professional', '2017', null, true, null],
    ['Reviewer', 'Autonomous Robots / Applied Intelligence', 'reviewer', '2015', null, true, null],
    ['Committee Member', 'National Robotics Working Group', 'committee', '2014', '2019', false, null]
  ];
  for (const [i, r] of service.entries()) {
    await insert('service_leadership', {
      profile_id: profile.id, role: r[0], organization: r[1], service_type: r[2], start_date: r[3],
      end_date: r[4], current: r[5], description: r[6], display_order: i, visibility: 'published'
    });
  }

  for (const [i, m] of [
    ['Robotics Society', 'Professional association', 'Member', '2010', null],
    ['International Federation for Information Processing (IFIP)', 'Professional society', 'Working Group Member', '2016', null],
    ['Engineering Council', 'Engineering association', 'Chartered Engineer', '2006', null]
  ].entries()) {
    await insert('professional_memberships', {
      profile_id: profile.id, organization: m[0], membership_type: m[1], position: m[2],
      start_date: m[3], end_date: m[4], display_order: i, visibility: 'published'
    });
  }

  for (const [i, o] of [
    ['Institute of Intelligent Systems & Robotics', 'institute', 'Director', '2022'],
    ['Faculty of Engineering and Technology', 'faculty', 'Professor', '2014'],
    ['Robotics and Autonomous Systems Group', 'group', 'Research Lead', '2015']
  ].entries()) {
    await insert('organizational_memberships', {
      profile_id: profile.id, organization: o[0], organization_type: o[1], role: o[2],
      start_date: o[3], display_order: i, visibility: 'published'
    });
  }

  const awards = [
    ['Excellence in Research Award', 'National Institute of Science and Technology', 'research', '2023', 'Awarded for sustained contributions to autonomous systems research.'],
    ['Distinguished Teaching Award', 'Faculty of Engineering and Technology', 'teaching', '2021', null],
    ['Best Paper Award', 'IEEE International Conference on Robotics and Automation', 'best_paper', '2021', 'Best paper award for work on deep learning for infrastructure inspection.'],
    ['National Engineering Leadership Award', 'Engineering Council', 'leadership', '2019', null],
    ['Industry Partnership Recognition', 'AgriTech Industries', 'industry', '2023', null],
    ['Fellow', 'Robotics Society', 'professional', '2018', null],
    ['Early Career Research Prize', 'National Science Foundation', 'research', '2012', null],
    ['Supervisor of the Year', 'Graduate School', 'teaching', '2020', null],
    ['Community Engagement Award', 'Ministry of Education', 'other', '2017', null]
  ];
  for (const [i, a] of awards.entries()) {
    await insert('awards', {
      profile_id: profile.id, award_name: a[0], awarding_organization: a[1], category: a[2],
      award_date: a[3], description: a[4], display_order: i, visibility: 'published'
    });
  }

  const mediaRows = [
    ['youtube', 'Autonomous field robots in practice', 'YouTube', 'https://www.youtube.com/watch?v=example1', '2024-03-15', 'Public lecture on deploying autonomous robots for infrastructure inspection.'],
    ['youtube', 'Information fusion and the future of robotics', 'YouTube', 'https://www.youtube.com/watch?v=example2', '2023-11-02', null],
    ['interview', 'Building research capacity in robotics', 'Science Weekly Podcast', 'https://example.com/interview-robotics', '2024-01-20', 'Interview on research capacity building and graduate training.'],
    ['podcast', 'AI in engineering education', 'EdTech Talks', 'https://example.com/podcast-ai', '2023-09-05', null],
    ['news', 'Institute launches autonomous inspection programme', 'National News', 'https://example.com/news-robotics', '2022-04-11', null],
    ['image', 'Research group field trial', null, null, '2023-07-01', null]
  ];
  for (const [i, m] of mediaRows.entries()) {
    await insert('media', {
      profile_id: profile.id, type: m[0], title: m[1], platform: m[2], url: m[3], media_date: m[4],
      description: m[5], caption: m[0] === 'image' ? 'Field trial of the autonomous inspection platform.' : null,
      alt_text: m[0] === 'image' ? 'Researchers with a mobile robot outdoors' : null,
      display_order: i, visibility: 'published'
    });
  }

  const settings = {
    site_name: 'ASMARE Academic Profile',
    site_tagline: 'Academic & Researcher Professional Profile',
    institution_name: 'Faculty of Engineering and Technology',
    institution_url: 'https://example.edu',
    footer_address: 'P.O. Box 1234, Asmara, Eritrea',
    footer_phone: '+291 7 123 456',
    footer_email: 'contact@example.edu',
    copyright: `\u00A9 ${new Date().getFullYear()} Asmare Berhane. All rights reserved.`,
    privacy_policy: '# Privacy Policy\n\nThis site processes only the information you submit through the contact form.',
    cookie_policy: '# Cookie Policy\n\nThis site uses only essential cookies required for session management.',
    terms: '# Terms of Use\n\nContent on this site is provided for academic and professional information purposes.',
    accessibility: '# Accessibility Statement\n\nThis site targets WCAG 2.1 AA conformance. Please contact us if you encounter barriers.',
    seo_title_suffix: ' | Asmare Berhane',
    seo_meta_description: 'Academic and researcher profile of Asmare Berhane — publications, funded research, teaching, supervision and service.',
    og_image: ''
  };
  const settingsRows = Object.entries(settings).map(([key, value]) => ({ key, value, group_name: 'general' }));
  const { error: settingsError } = await supabase.from('settings').upsert(settingsRows, { onConflict: 'key' });
  if (settingsError) throw new Error(`Settings insert failed: ${settingsError.message}`);

  console.log('[seed] Demo content seeded successfully.');
  console.log('[seed] Logins (password = "password"):');
  console.log('[seed]   admin@asmare.test  (Administrator)');
  console.log('[seed]   owner@asmare.test   (Profile Owner)');
  console.log('[seed]   editor@asmare.test  (Editor)');
}

main().catch((e) => {
  console.error('[seed] Failed:', e.message);
  process.exit(1);
});