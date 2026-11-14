import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen, Headphones, PenTool, FileText, LayoutDashboard,
  CheckCircle2, Circle, AlertTriangle, Sparkles, ChevronRight,
  ChevronLeft, ChevronDown, ChevronUp, Menu, X, Search,
  Clock, Award, Target, TrendingUp, RotateCcw, MessageSquare,
  Send, Layers, HelpCircle, CheckSquare, BookMarked, Compass,
  Lightbulb, Eye, EyeOff, Check, XCircle, ArrowRight,
  ListChecks, GraduationCap, Info, Zap, ShieldAlert,
  Calendar, RefreshCw, Edit3
} from 'lucide-react';

// ============================================================================
// 1. CURRICULUM DATA: HISTORICAL CONTEXT & CONVERSION TABLES (pp. xi–xx)
// ============================================================================

const HISTORICAL_CONTEXT = {
  title: 'Konteks Historis Kurikulum: Format TOEFL 2001 (PBT & CBT)',
  summary:
    'Aplikasi ini disusun secara setia berdasarkan buku Deborah Phillips (2001), "Longman Complete Course for the TOEFL Test: Preparation for the Computer and Paper Tests" (687 halaman). Buku ini mengajarkan dua format resmi TOEFL pada era tersebut:',
  formats: [
    {
      name: 'Paper-Based TOEFL (PBT — Format 1995)',
      scale: 'Skala Skor: 217 – 677',
      desc: 'Ujian berbasis kertas menggunakan lembar jawaban pensil (LJK). Terdiri dari 3 section pilihan ganda (Listening, Structure & Written Expression, Reading) ditambah Test of Written English (TWE) terpisah pada jadwal tertentu.'
    },
    {
      name: 'Computer-Based TOEFL (CBT — Format 1998)',
      scale: 'Skala Skor: 0 – 300 (Adaptive)',
      desc: 'Ujian berbasis komputer dengan sistem Computer-Adaptive pada Listening dan Structure (tingkat kesulitan soal menyesuaikan jawaban sebelumnya). Section Writing (Essay) terintegrasi langsung ke dalam skor akhir.'
    }
  ],
  ibtNote:
    'Catatan Perbedaan dengan TOEFL iBT Modern (2005–sekarang): TOEFL iBT modern menggunakan skala 0–120 (Reading, Listening, Speaking, Writing), menguji Speaking secara langsung, menghilangkan bagian Structure terpisah (mengintegrasikannya ke Writing & Speaking), serta memakai tugas Integrated Writing/Speaking. Meskipun demikian, 60 Skill Structure, 34 Skill Listening, 14 Skill Reading, dan 8 Skill Writing dalam buku Longman 2001 tetap menjadi fondasi tata bahasa dan pemahaman akademik terbaik untuk menguasai TOEFL ITP (yang masih menggunakan format PBT hingga hari ini) maupun persiapan dasar TOEFL iBT.'
};

const FORMAT_COMPARISON_TABLE = [
  {
    section: '1. Listening Comprehension',
    pbt: '50 soal • 35 menit (Linear: Part A Short Dialogues, Part B Long Conversations, Part C Long Talks)',
    cbt: '30–50 soal • 40–60 menit (Computer-Adaptive: Short Dialogues, Casual Conversations, Academic Discussions, Academic Lectures + visual/multi-select)'
  },
  {
    section: '2. Structure & Written Expression',
    pbt: '40 soal • 25 menit (15 soal Structure melengkapi kalimat + 25 soal Written Expression mencari kesalahan kata/frasa)',
    cbt: '20–25 soal • 15–20 menit (Computer-Adaptive: campuran Structure & Written Expression dalam satu alur)'
  },
  {
    section: '3. Reading Comprehension',
    pbt: '50 soal • 55 menit (5 teks bacaan akademik, masing-masing ±10 soal pilihan ganda)',
    cbt: '44–60 soal • 70–90 menit (4–5 teks bacaan + tipe soal interaktif: klik kalimat rujukan, sisipkan kalimat [■], klik kata)'
  },
  {
    section: '4. Writing (TWE / Essay)',
    pbt: '1 topik esai • 30 menit (Test of Written English — skor terpisah skala 1–6, tidak digabung ke skor 217–677)',
    cbt: '1 topik esai • 30 menit (Wajib diketik atau ditulis tangan; skor skala 1–6 digabung ke perhitungan skor total 0–300)'
  }
];

const SCORE_CONVERSION_TABLE = [
  { pbt: '677', cbt: '300', writing: '6.0', level: 'Mahir / Sangat Tinggi (Expert)' },
  { pbt: '650', cbt: '280', writing: '5.5', level: 'Sangat Baik (Advanced)' },
  { pbt: '600', cbt: '250', writing: '5.0', level: 'Baik Sekali (High Intermediate–Advanced)' },
  { pbt: '550', cbt: '213', writing: '4.5', level: 'Menengah Atas (Standar Pascasarjana / Beasiswa)' },
  { pbt: '500', cbt: '173', writing: '4.0', level: 'Menengah (Standar Sarjana / Umum)' },
  { pbt: '450', cbt: '133', writing: '3.5', level: 'Menengah Bawah (Developing)' },
  { pbt: '400', cbt: '97', writing: '3.0', level: 'Dasar Menengah (Elementary–Low Intermediate)' },
  { pbt: '350', cbt: '63', writing: '2.0', level: 'Dasar (Elementary)' },
  { pbt: '300', cbt: '40', writing: '1.0', level: 'Pemula (Beginner)' }
];

// ============================================================================
// 2. LISTENING MASTERCLASS DATA (ALL 34 SKILLS, pp. 22–164)
// ============================================================================

const LISTENING_CATEGORIES = [
  { id: 'A', name: 'A. Short Dialogues (Skills 1–17)', pages: 'pp. 29–75', desc: 'Percakapan singkat 2 baris antara pria dan wanita diikuti 1 pertanyaan.' },
  { id: 'B', name: 'B. Long Conversations (Skills 18–22)', pages: 'pp. 78–86', desc: 'Percakapan panjang (PBT Part B) seputar kehidupan kampus atau topik umum.' },
  { id: 'C', name: 'C. Long Talks (Skills 23–27)', pages: 'pp. 89–97', desc: 'Monolog/kuliah singkat (PBT Part C) tentang sains, sejarah, atau pengumuman kampus.' },
  { id: 'D', name: 'D. Casual Conversations (Skill 28)', pages: 'pp. 100–102', desc: 'Format CBT: percakapan santai mahasiswa dengan tampilan visual konteks.' },
  { id: 'E', name: 'E. Academic Discussions (Skills 29–31)', pages: 'pp. 110–133', desc: 'Format CBT: diskusi kelas antara profesor dan beberapa mahasiswa.' },
  { id: 'F', name: 'F. Academic Lectures (Skills 32–34)', pages: 'pp. 140–164', desc: 'Format CBT: kuliah akademik terstruktur lengkap dengan bagan dan pertanyaan multi-aspek.' }
];

const RAW_LISTENING_SKILLS = [
  // A. Short Dialogues (1-17)
  {
    num: 1, cat: 'A', page: 'p. 29', title: 'Focus on the last line',
    indonesianTitle: 'Fokus pada Baris Terakhir Pembicara Kedua',
    concept: 'Jawaban pertanyaan Short Dialogue hampir selalu terdapat pada baris terakhir yang diucapkan pembicara kedua. Baris pertama hanya berfungsi sebagai konteks.',
    formula: 'Line 1 (Konteks) → Line 2 (Kunci Jawaban Utama) → Question (Biasanya menanyakan pembicara ke-2)',
    dialogue: [
      { speaker: 'Man', text: 'Billy really made a big mistake this time.' },
      { speaker: 'Woman', text: 'Yes, he forgot to turn in his research paper.' },
      { speaker: 'Narrator', text: 'What does the woman say about Billy?' }
    ],
    translation: 'Pria: Billy benar-benar membuat kesalahan besar kali ini.\nWanita: Ya, dia lupa mengumpulkan makalah penelitiannya.\nNarator: Apa yang dikatakan wanita itu tentang Billy?',
    clue: 'Fokus pada frasa "forgot to turn in his research paper" di baris terakhir.',
    strategy: 'Dengarkan baris pertama untuk memahami topik, tetapi pusatkan konsentrasi penuh pada baris kedua dan nyatakan kembali maknanya dengan kata-kata berbeda.',
    question: 'What does the woman say about Billy?',
    options: [
      '(A) It was the first time he made a mistake.',
      '(B) He forgot to write his paper.',
      '(C) He turned in the paper in the wrong place.',
      '(D) He didn\'t remember to submit his assignment.'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — "first time" tidak disebutkan; pria berkata "this time".',
      '(B) Salah — Dia lupa mengumpulkan (turn in), bukan lupa menulis.',
      '(C) Salah — Tidak ada informasi tentang salah tempat.',
      '(D) Benar — "didn\'t remember to submit" adalah parafrase tepat dari "forgot to turn in".'
    ]
  },
  {
    num: 2, cat: 'A', page: 'p. 31', title: 'Choose answers with synonyms',
    indonesianTitle: 'Pilih Jawaban yang Menggunakan Sinonim (Parafrase)',
    concept: 'Jawaban yang benar pada TOEFL jarang mengulang kata-kata persis seperti di dialog; jawaban benar menggunakan sinonim atau struktur kalimat berbeda dengan makna sama.',
    formula: 'Kata Kunci di Line 2 ≠ Kata di Opsi Benar (Gunakan Sinonim)',
    dialogue: [
      { speaker: 'Woman', text: 'Why is Barbara feeling so happy?' },
      { speaker: 'Man', text: 'She just started working in a real estate agency.' },
      { speaker: 'Narrator', text: 'What does the man say about Barbara?' }
    ],
    translation: 'Wanita: Mengapa Barbara merasa sangat bahagia?\nPria: Dia baru saja mulai bekerja di sebuah agen properti.\nNarator: Apa yang dikatakan pria tentang Barbara?',
    clue: '"started working" = "began a new job"; "real estate agency" = "selling houses/property".',
    strategy: 'Identifikasi kata kerja/kata benda kunci di baris kedua, lalu cari sinonimnya di opsi jawaban.',
    question: 'What does the man say about Barbara?',
    options: [
      '(A) She always liked her work in real estate.',
      '(B) She began a new job.',
      '(C) She just bought some real estate.',
      '(D) She bought a real estate agency.'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Dia baru saja mulai ("just started"), bukan "always liked".',
      '(B) Benar — "began a new job" adalah sinonim dari "started working".',
      '(C) Salah — Dia bekerja di agen properti, bukan membeli properti.',
      '(D) Salah — Dia bekerja di sana, bukan membeli perusahaannya.'
    ]
  },
  {
    num: 3, cat: 'A', page: 'p. 33', title: 'Avoid similar sounds',
    indonesianTitle: 'Hindari Jebakan Kata yang Bunyinya Mirip',
    concept: 'Pembuat soal sering menempatkan kata-kata yang bunyinya mirip (homofon/minimal pairs, lihat Appendix A) dengan kata yang terdengar di dialog sebagai pengecoh.',
    formula: 'Bunyi Mirip di Opsi (apartment ↔ appointment) = Jebakan Pengecoh',
    dialogue: [
      { speaker: 'Man', text: 'Why couldn\'t Mark come with us?' },
      { speaker: 'Woman', text: 'He was searching for a new apartment.' },
      { speaker: 'Narrator', text: 'What does the woman say about Mark?' }
    ],
    translation: 'Pria: Mengapa Mark tidak bisa ikut dengan kita?\nWanita: Dia sedang mencari apartemen baru.\nNarator: Apa yang dikatakan wanita tentang Mark?',
    clue: 'Kata "searching" (mencari) dan "apartment" (apartemen) dijebak dengan "research" dan "appointment".',
    strategy: 'Waspadai opsi yang mengulang bunyi mirip seperti searching/research atau apartment/appointment.',
    question: 'What does the woman say about Mark?',
    options: [
      '(A) He was in the department office.',
      '(B) He was looking for a place to live.',
      '(C) He was working on his research project.',
      '(D) He had an appointment at church.'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — "department" mengecoh bunyi "apartment".',
      '(B) Benar — "looking for a place to live" adalah makna dari "searching for a new apartment".',
      '(C) Salah — "research" mengecoh bunyi "searching".',
      '(D) Salah — "appointment" mengecoh bunyi "apartment".'
    ]
  },
  {
    num: 4, cat: 'A', page: 'p. 36', title: 'Draw conclusions about who, what, where',
    indonesianTitle: 'Menarik Kesimpulan tentang Siapa, Apa, dan Di Mana',
    concept: 'Pertanyaan sering meminta Anda menyimpulkan siapa pembicara (profesi), apa yang akan dilakukan selanjutnya, atau di mana percakapan terjadi berdasarkan petunjuk kosakata.',
    formula: 'Petunjuk Kosakata (Clue Words) → Kesimpulan Logis (Who / What / Where)',
    dialogue: [
      { speaker: 'Woman', text: 'Can you tell me what assignments I missed when I was absent from your class?' },
      { speaker: 'Man', text: 'You missed one homework assignment and a quiz.' },
      { speaker: 'Narrator', text: 'Who is the man?' }
    ],
    translation: 'Wanita: Bisakah Bapak memberi tahu tugas apa saja yang terlewat saat saya absen dari kelas Bapak?\nPria: Kamu melewatkan satu tugas PR dan satu kuis.\nNarator: Siapakah pria itu?',
    clue: 'Petunjuk: "your class", "homework assignment", "quiz" → Profesor/Guru.',
    strategy: 'Kumpulkan petunjuk konteks dari kedua baris untuk menyimpulkan profesi, lokasi, atau tindakan berikutnya.',
    question: 'Who is the man?',
    options: [
      '(A) A newspaper editor',
      '(B) A police officer',
      '(C) A teacher',
      '(D) A student'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Tidak ada konteks surat kabar.',
      '(B) Salah — Tidak ada konteks kepolisian.',
      '(C) Benar — Memberikan PR dan kuis di kelas menunjukkan pria itu adalah pengajar.',
      '(D) Salah — Wanita itu adalah mahasiswanya.'
    ]
  },
  {
    num: 5, cat: 'A', page: 'p. 39', title: 'Listen for who and what in passives',
    indonesianTitle: 'Cermati Siapa dan Apa dalam Kalimat Pasif',
    concept: 'Jika dialog menggunakan kalimat aktif, jawaban benar sering memakai kalimat pasif (dan sebaliknya), sehingga posisi pelaku (agent) dan objek bertukar.',
    formula: 'Dialog Aktif (S + V + O) ↔ Jawaban Pasif (O + be + V3 + by S)',
    dialogue: [
      { speaker: 'Man', text: 'Did Sally go to the bank this morning?' },
      { speaker: 'Woman', text: 'Yes, she did. She got a new checking account.' },
      { speaker: 'Narrator', text: 'What does the woman imply?' }
    ],
    translation: 'Pria: Apakah Sally pergi ke bank pagi ini?\nWanita: Ya. Dia membuka rekening giro baru.\nNarator: Apa yang disiratkan wanita itu?',
    clue: '"She got a new checking account" (Aktif) ↔ "A new checking account was opened" (Pasif).',
    strategy: 'Perhatikan siapa yang melakukan tindakan dan siapa/apa yang menerima tindakan agar tidak tertukar antara subjek dan objek.',
    question: 'What does the woman imply?',
    options: [
      '(A) Sally wrote several checks.',
      '(B) Sally wanted to check up on the bank.',
      '(C) A new checking account was opened.',
      '(D) Sally checked on the balance in her account.'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Tidak disebutkan menulis cek.',
      '(B) Salah — Permainan kata "check up".',
      '(C) Benar — Perubahan kalimat aktif "She got a new checking account" menjadi pasif.',
      '(D) Salah — Tidak membahas saldo rekening.'
    ]
  },
  {
    num: 6, cat: 'A', page: 'p. 41', title: 'Listen for who and what with multiple nouns',
    indonesianTitle: 'Bedakan Siapa dan Apa Saat Ada Banyak Kata Benda',
    concept: 'Ketika ada lebih dari satu orang/kata benda disebut dalam satu kalimat, peserta tes sering bingung menentukan siapa melakukan apa.',
    formula: 'Noun 1 + Verb + Noun 2 → Petakan pelaku vs penerima dengan akurat',
    dialogue: [
      { speaker: 'Man', text: 'Do you know who is in the band now?' },
      { speaker: 'Woman', text: 'I heard that Mara replaced Robert in the band.' },
      { speaker: 'Narrator', text: 'What does the woman say about the band?' }
    ],
    translation: 'Pria: Apakah kamu tahu siapa yang ada di band sekarang?\nWanita: Saya dengar Mara menggantikan Robert di band itu.\nNarator: Apa yang dikatakan wanita tentang band itu?',
    clue: 'Mara = anggota baru (pengganti); Robert = anggota lama yang digantikan.',
    strategy: 'Catat secara mental urutan subjek dan objek ketika dua nama orang muncul berdekatan.',
    question: 'What does the woman say about the band?',
    options: [
      '(A) Robert became a new member of the band.',
      '(B) Robert took Mara\'s place in the band.',
      '(C) Mara didn\'t have a place in the band.',
      '(D) Mara took Robert\'s place in the band.'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — Robert justru keluar/digantikan.',
      '(B) Salah — Terbalik pelakunya.',
      '(C) Salah — Mara justru masuk menggantikan Robert.',
      '(D) Benar — "Mara took Robert\'s place" sama dengan "Mara replaced Robert".'
    ]
  },
  {
    num: 7, cat: 'A', page: 'p. 45', title: 'Listen for negative expressions',
    indonesianTitle: 'Pahami Ungkapan Negatif (not, un-, in-, dis-, nobody)',
    concept: 'Pernyataan negatif di dialog sering dijawab dengan pernyataan positif menggunakan kata berlawanan makna (antonim).',
    formula: 'not + Adjective A ↔ Positive + Antonim A (mis. not sad = happy)',
    dialogue: [
      { speaker: 'Man', text: 'How did they get to their grandmother\'s house in Maine in only five hours?' },
      { speaker: 'Woman', text: 'They didn\'t drive slowly on the trip to Maine.' },
      { speaker: 'Narrator', text: 'What does the woman say about the trip?' }
    ],
    translation: 'Pria: Bagaimana mereka bisa sampai ke rumah nenek mereka di Maine hanya dalam lima jam?\nWanita: Mereka tidak menyetir dengan pelan dalam perjalanan ke Maine.\nNarator: Apa yang dikatakan wanita tentang perjalanan itu?',
    clue: '"didn\'t drive slowly" = "drove rather quickly".',
    strategy: 'Ubah bentuk negatif ("not + kata sifat/keterangan") menjadi padanan positifnya sebelum memilih opsi.',
    question: 'What does the woman say about the trip?',
    options: [
      '(A) They drove rather quickly.',
      '(B) They couldn\'t have driven more slowly.',
      '(C) They wanted to travel slowly to Maine.',
      '(D) They didn\'t drive to Maine.'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Benar — Tidak menyetir pelan berarti menyetir cukup cepat.',
      '(B) Salah — Maknanya justru mereka menyetir sangat pelan.',
      '(C) Salah — Bertentangan dengan fakta.',
      '(D) Salah — Mereka memang menyetir ke Maine.'
    ]
  },
  {
    num: 8, cat: 'A', page: 'p. 47', title: 'Listen for double negative expressions',
    indonesianTitle: 'Cermati Ungkapan Negatif Ganda (Double Negatives)',
    concept: 'Dua unsur negatif dalam satu kalimat (misalnya "not" + "impossible", atau "neither...nor" dengan "not") menghasilkan makna positif atau kemungkinan.',
    formula: 'Negative 1 + Negative 2 = Makna Positif (mis. not impossible = possible)',
    dialogue: [
      { speaker: 'Man', text: 'I can\'t believe the news that I heard about the concert.' },
      { speaker: 'Woman', text: 'Well, it isn\'t impossible for the concert to take place.' },
      { speaker: 'Narrator', text: 'What does the woman say about the concert?' }
    ],
    translation: 'Pria: Saya tidak percaya berita yang saya dengar tentang konser itu.\nWanita: Yah, bukan tidak mungkin konser itu tetap berlangsung.\nNarator: Apa yang dikatakan wanita tentang konser itu?',
    clue: '"isn\'t" (negatif 1) + "impossible" (negatif 2) = "might happen / possible".',
    strategy: 'Coret dua unsur negatif yang saling meniadakan untuk menemukan makna positifnya.',
    question: 'What does the woman say about the concert?',
    options: [
      '(A) There\'s no possibility that the concert will take place.',
      '(B) The concert will definitely not take place.',
      '(C) The concert might take place.',
      '(D) The concert can\'t take place.'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Bertentangan dengan makna positif negatif ganda.',
      '(B) Salah — Makna negatif tunggal.',
      '(C) Benar — "isn\'t impossible" berarti konser masih mungkin terjadi.',
      '(D) Salah — Bertentangan dengan maksud pembicara.'
    ]
  },
  {
    num: 9, cat: 'A', page: 'p. 49', title: 'Listen for "almost negative" expressions',
    indonesianTitle: 'Kenali Ungkapan "Hampir Negatif" (hardly, barely, seldom, rarely)',
    concept: 'Kata seperti hardly, barely, scarcely, only (bermakna hampir tidak pernah/sedikit) dan rarely, seldom (bermakna hampir tidak pernah) membawa nuansa negatif.',
    formula: 'hardly / barely / scarcely = almost none • rarely / seldom = almost never',
    dialogue: [
      { speaker: 'Woman', text: 'Were you able to pay the electric bill?' },
      { speaker: 'Man', text: 'I had barely enough money.' },
      { speaker: 'Narrator', text: 'What does the man imply?' }
    ],
    translation: 'Wanita: Apakah kamu sanggup membayar tagihan listrik?\nPria: Uangku hampir tidak cukup (pas-pasan sekali).\nNarator: Apa yang disiratkan pria itu?',
    clue: '"barely enough" berarti dia berhasil membayar dengan uang yang sangat pas-pasan.',
    strategy: 'Pahami bahwa "barely/hardly enough" berarti masih cukup secara tipis, bukan tidak cukup sama sekali.',
    question: 'What does the man imply?',
    options: [
      '(A) He had plenty of money for the bill.',
      '(B) He did not have enough money for the bill.',
      '(C) He paid the bill but has no money left.',
      '(D) He was unable to pay the bill.'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — "barely" berlawanan dengan "plenty".',
      '(B) Salah — Uangnya masih cukup ("enough"), meski pas-pasan.',
      '(C) Benar — Dia membayar tagihan tetapi tidak ada sisa uang lagi.',
      '(D) Salah — Dia mampu membayarnya.'
    ]
  },
  {
    num: 10, cat: 'A', page: 'p. 51', title: 'Listen for negatives with comparatives',
    indonesianTitle: 'Pahami Bentuk Negatif dengan Komparatif (Makna Superlatif)',
    concept: 'Kombinasi kalimat negatif + bentuk komparatif (-er / more) bermakna superlatif (paling...). Contoh: "No one is more intelligent than she is" = "She is the most intelligent".',
    formula: 'Negative + Comparative (-er / more) = Superlative (-est / most)',
    dialogue: [
      { speaker: 'Woman', text: 'What do you think of the new student in math class?' },
      { speaker: 'Man', text: 'No one is more intelligent than she is.' },
      { speaker: 'Narrator', text: 'What does the man say about the new student?' }
    ],
    translation: 'Wanita: Bagaimana pendapatmu tentang mahasiswi baru di kelas matematika?\nPria: Tidak ada seorang pun yang lebih cerdas daripada dia.\nNarator: Apa yang dikatakan pria tentang mahasiswi baru itu?',
    clue: '"No one is more intelligent" = "She is the smartest / most intelligent".',
    strategy: 'Setiap kali mendengar "no one / nothing / never" diikuti "-er / more", langsung terjemahkan menjadi "paling...".',
    question: 'What does the man say about the new student?',
    options: [
      '(A) She is not very smart.',
      '(B) He is smarter than she is.',
      '(C) Other students are smarter than she is.',
      '(D) She is the smartest student in the class.'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — Kebalikan dari maksud kalimat.',
      '(B) Salah — Pria tersebut tidak membandingkan dirinya secara lebih pintar.',
      '(C) Salah — Tidak ada mahasiswa lain yang lebih pintar darinya.',
      '(D) Benar — Makna superlatif dari negatif + komparatif.'
    ]
  },
  {
    num: 11, cat: 'A', page: 'p. 55', title: 'Listen for expressions of agreement',
    indonesianTitle: 'Kenali Ungkapan Persetujuan (So do I, Me too, Neither do I, You can say that again)',
    concept: 'Ungkapan persetujuan dalam percakapan bahasa Inggris sering berbentuk idiom seperti "So do I", "Neither do I", "I\'ll say!", atau "You can say that again!".',
    formula: 'Positif: So do I / Me too / I\'ll say • Negatif: Neither do I / I don\'t either',
    dialogue: [
      { speaker: 'Man', text: 'I think that the hypothesis is indefensible.' },
      { speaker: 'Woman', text: 'So do I.' },
      { speaker: 'Narrator', text: 'What does the woman mean?' }
    ],
    translation: 'Pria: Menurutku hipotesis itu tidak dapat dipertahankan.\nWanita: Saya juga berpikir begitu.\nNarator: Apa maksud wanita itu?',
    clue: '"So do I" menyatakan persetujuan penuh terhadap pendapat pembicara pertama.',
    strategy: 'Hafalkan idiom persetujuan ("You can say that again" bukan meminta mengulang ucapan, melainkan "Saya sangat setuju!").',
    question: 'What does the woman mean?',
    options: [
      '(A) She is unsure about the hypothesis.',
      '(B) The hippopotamus is behind the fence.',
      '(C) She thinks that the hypothesis can be defended.',
      '(D) She agrees with the man.'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — Dia yakin dan setuju.',
      '(B) Salah — Pengecoh bunyi "hippopotamus" vs "hypothesis".',
      '(C) Salah — Dia setuju bahwa hipotesis itu "indefensible" (tidak dapat dipertahankan).',
      '(D) Benar — "So do I" berarti dia sependapat dengan pria tersebut.'
    ]
  },
  {
    num: 12, cat: 'A', page: 'p. 57', title: 'Listen for expressions of uncertainty and suggestion',
    indonesianTitle: 'Kenali Ungkapan Ketidakpastian dan Saran',
    concept: 'Ungkapan seperti "...isn\'t it?" (question tag naik), "As far as I know", atau "Why not...?" menunjukkan ketidakpastian atau memberikan saran.',
    formula: 'Uncertainty: As far as I know / ...isn\'t it? • Suggestion: Why not...? / Let\'s...',
    dialogue: [
      { speaker: 'Man', text: 'Do you know anything about the final exam in physics?' },
      { speaker: 'Woman', text: 'It\'s going to be rather difficult, isn\'t it?' },
      { speaker: 'Narrator', text: 'What does the woman mean?' }
    ],
    translation: 'Pria: Apakah kamu tahu sesuatu tentang ujian akhir fisika?\nWanita: Ujiannya akan cukup sulit, bukan?\nNarator: Apa maksud wanita itu?',
    clue: 'Question tag "...isn\'t it?" menunjukkan wanita itu tidak yakin sepenuhnya.',
    strategy: 'Bedakan pernyataan pasti dengan pertanyaan ekor (tag questions) dan ekspresi saran seperti "Why not...?".',
    question: 'What does the woman mean?',
    options: [
      '(A) The exam is not going to be too difficult.',
      '(B) She\'s positive that it\'s going to be hard.',
      '(C) She thinks that it might be hard.',
      '(D) She has no idea about the exam.'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Dia menduga ujiannya cukup sulit.',
      '(B) Salah — "isn\'t it?" menunjukkan dia tidak 100% yakin (bukan "positive").',
      '(C) Benar — "thinks that it might be hard" mencerminkan dugaan/ketidakpastian.',
      '(D) Salah — Dia punya perkiraan bahwa ujian akan sulit.'
    ]
  },
  {
    num: 13, cat: 'A', page: 'p. 60', title: 'Listen for emphatic expressions of surprise',
    indonesianTitle: 'Kenali Ungkapan Keterkejutan yang Ditekankan (Emphatic Surprise)',
    concept: 'Bentuk penekanan seperti "Then he DID get a job!" atau "So you ARE coming!" menunjukkan bahwa pembicara sebelumnya mengira kebalikannya.',
    formula: 'Penekanan Auxiliary (did / is / have) = Sebelumnya mengira tidak terjadi',
    dialogue: [
      { speaker: 'Woman', text: 'Did you see Paul driving around in a Mustang?' },
      { speaker: 'Man', text: 'Then he DID get a new car!' },
      { speaker: 'Narrator', text: 'What had the man thought?' }
    ],
    translation: 'Wanita: Apakah kamu melihat Paul berkeliling mengendarai Mustang?\nPria: Jadi dia BENAR-BENAR membeli mobil baru!\nNarator: Apa yang sebelumnya dipikirkan pria itu?',
    clue: 'Penekanan "DID get" berarti sebelumnya pria tersebut mengira Paul tidak membeli mobil baru.',
    strategy: 'Perhatikan kata bantu (do/does/did, be, have) yang diucapkan dengan penekanan intonasi tinggi.',
    question: 'What had the man thought?',
    options: [
      '(A) Paul would definitely get a Mustang.',
      '(B) Paul did not know how to drive.',
      '(C) Paul did not like Mustangs.',
      '(D) Paul would not get a new car.'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — Jika sudah yakin, dia tidak akan terkejut.',
      '(B) Salah — Tidak ada informasi tentang kemampuan menyetir.',
      '(C) Salah — Tidak membahas kesukaan merek.',
      '(D) Benar — Keterkejutan "he DID get" membuktikan dia mengira Paul tidak akan mendapat mobil baru.'
    ]
  },
  {
    num: 14, cat: 'A', page: 'p. 63', title: 'Listen for wishes',
    indonesianTitle: 'Pahami Makna Harapan / Pengandaian (Wishes)',
    concept: 'Kalimat dengan "wish" selalu menyiratkan kenyataan yang berlawanan dengan harapan tersebut (Past tense = kenyataan saat ini berlawanan; Past Perfect = kenyataan lampau berlawanan).',
    formula: 'I wish + Past (had/were) → Kenyataan Sekarang Berlawanan • I wish + Past Perfect → Kenyataan Lampau Berlawanan',
    dialogue: [
      { speaker: 'Woman', text: 'It\'s too bad that you have to stay here and work during the school break.' },
      { speaker: 'Man', text: 'I really wish I could go with you and the others to Palm Springs.' },
      { speaker: 'Narrator', text: 'What does the man mean?' }
    ],
    translation: 'Wanita: Sayang sekali kamu harus tinggal di sini dan bekerja selama libur kuliah.\nPria: Saya benar-benar berharap bisa ikut denganmu dan yang lain ke Palm Springs.\nNarator: Apa maksud pria itu?',
    clue: '"I wish I could go" (harapan) → Kenyataan: "He can\'t go".',
    strategy: 'Balikkan makna di belakang kata "wish": jika positif di dalam wish, berarti negatif di kenyataan.',
    question: 'What does the man mean?',
    options: [
      '(A) Maybe he will go with the others on the trip.',
      '(B) He is unable to go on the trip.',
      '(C) He\'s happy to be going on the trip.',
      '(D) He\'s going on the trip, but not with the others.'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Dia harus bekerja dan tidak bisa pergi.',
      '(B) Benar — "wish I could go" berarti dia tidak mampu/bisa ikut pergi.',
      '(C) Salah — Dia tidak ikut pergi.',
      '(D) Salah — Dia tinggal untuk bekerja.'
    ]
  },
  {
    num: 15, cat: 'A', page: 'p. 66', title: 'Listen for untrue conditions',
    indonesianTitle: 'Pahami Kalimat Pengandaian yang Tidak Nyata (Untrue Conditions)',
    concept: 'Kalimat pengandaian Tipe 2 (If + Past) dan Tipe 3 (If + Past Perfect) menyatakan kondisi yang berlawanan dengan fakta sebenarnya.',
    formula: 'If + Past → Fakta Sekarang Berlawanan • If + Past Perfect → Fakta Lampau Berlawanan',
    dialogue: [
      { speaker: 'Man', text: 'Do you think that you\'ll be able to go to the party?' },
      { speaker: 'Woman', text: 'If I had time, I would go.' },
      { speaker: 'Narrator', text: 'What does the woman say about the party?' }
    ],
    translation: 'Pria: Apakah menurutmu kamu bisa pergi ke pesta itu?\nWanita: Seandainya saya punya waktu, saya akan pergi.\nNarator: Apa yang dikatakan wanita tentang pesta itu?',
    clue: '"If I had time, I would go" → Fakta: Dia tidak punya waktu, jadi tidak bisa pergi.',
    strategy: 'Identifikasi bentuk lampau setelah "if" sebagai sinyal bahwa kondisi tersebut tidak terjadi di dunia nyata.',
    question: 'What does the woman say about the party?',
    options: [
      '(A) Maybe she\'ll go.',
      '(B) She has time, so she\'ll go.',
      '(C) She is going even if she doesn\'t have time.',
      '(D) It\'s impossible to go.'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — Pengandaian ini menunjukkan dia tidak bisa pergi.',
      '(B) Salah — Justru dia tidak punya waktu.',
      '(C) Salah — Dia tidak akan pergi.',
      '(D) Benar — Karena tidak punya waktu, mustahil baginya untuk pergi.'
    ]
  },
  {
    num: 16, cat: 'A', page: 'p. 70', title: 'Listen for two- and three-part verbs',
    indonesianTitle: 'Pahami Kata Kerja Dua & Tiga Bagian (Phrasal Verbs — Appendix B)',
    concept: 'Phrasal verbs (misalnya "call off", "put off", "run out of", "cut down on") memiliki makna idiomatik yang berbeda dari kata kerja dasarnya.',
    formula: 'Verb + Preposition/Particle = Makna Idiomatik Baru (Lihat Appendix B)',
    dialogue: [
      { speaker: 'Man', text: 'What time does the meeting start?' },
      { speaker: 'Woman', text: 'Didn\'t you hear that it was called off by the director?' },
      { speaker: 'Narrator', text: 'What does the woman say about the meeting?' }
    ],
    translation: 'Pria: Jam berapa rapatnya dimulai?\nWanita: Apakah kamu belum dengar bahwa rapatnya dibatalkan oleh direktur?\nNarator: Apa yang dikatakan wanita tentang rapat itu?',
    clue: '"called off" = "canceled" (dibatalkan).',
    strategy: 'Pelajari daftar Two- and Three-Part Verbs di Appendix B (Modul 7) karena sangat sering diujikan.',
    question: 'What does the woman say about the meeting?',
    options: [
      '(A) The director called a meeting.',
      '(B) The director phoned her about the meeting.',
      '(C) The director called the meeting to order.',
      '(D) The director canceled the meeting.'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — "call a meeting" berbeda dengan "call off a meeting".',
      '(B) Salah — Jebakan makna literal kata "call".',
      '(C) Salah — Rapat tidak jadi dilaksanakan.',
      '(D) Benar — "call off" berarti membatalkan ("cancel").'
    ]
  },
  {
    num: 17, cat: 'A', page: 'p. 72', title: 'Listen for idioms',
    indonesianTitle: 'Pahami Ungkapan Idiom Bahasa Inggris (Appendix C)',
    concept: 'Idiom (misalnya "burning the candle at both ends", "a piece of cake", "head and shoulders above") tidak boleh diterjemahkan kata demi kata.',
    formula: 'Idiom ≠ Makna Literal Kata → Cari Makna Kiasan (Lihat Appendix C)',
    dialogue: [
      { speaker: 'Man', text: 'Tom is a full-time student and is holding down a full-time job.' },
      { speaker: 'Woman', text: 'He\'s really burning the candle at both ends.' },
      { speaker: 'Narrator', text: 'What does the woman say about Tom?' }
    ],
    translation: 'Pria: Tom adalah mahasiswa penuh waktu sekaligus memegang pekerjaan penuh waktu.\nWanita: Dia benar-benar memforsir dirinya berlebihan (bekerja dari pagi hingga larut malam).\nNarator: Apa yang dikatakan wanita tentang Tom?',
    clue: '"burning the candle at both ends" = melakukan terlalu banyak aktivitas/bekerja terlalu keras tanpa cukup istirahat.',
    strategy: 'Hindari opsi jawaban yang mengandung kata literal dari idiom tersebut (seperti "candles" atau "fire").',
    question: 'What does the woman say about Tom?',
    options: [
      '(A) He\'s lighting a candle.',
      '(B) He\'s holding the candle at the top and the bottom.',
      '(C) He\'s doing too much.',
      '(D) He\'s working as a firefighter.'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Jebakan makna literal kata "candle".',
      '(B) Salah — Jebakan makna literal.',
      '(C) Benar — "burning the candle at both ends" berarti melakukan terlalu banyak hal sekaligus.',
      '(D) Salah — Tidak berhubungan dengan pemadam kebakaran.'
    ]
  },
  // B. Long Conversations (18-22)
  {
    num: 18, cat: 'B', page: 'p. 78', title: 'Anticipate the topics (Long Conversations)',
    indonesianTitle: 'Antisipasi Topik Percakapan Panjang dari Opsi Jawaban',
    concept: 'Sebelum rekaman Long Conversation diputar, baca sekilas opsi jawaban di buku/layar untuk menebak topik utama percakapan.',
    formula: 'Scan Opsi Jawaban Sebelumnya → Prediksi Topik Utama Percakapan',
    dialogue: [
      { speaker: 'Narrator', text: '(Previewing options: (A) Finding work on campus (B) Work in the employment office (C) Helping students find jobs (D) Ask the woman questions)' },
      { speaker: 'Man', text: 'I\'m looking for a part-time job on campus.' },
      { speaker: 'Woman', text: 'Then you\'ve come to the right place. The campus employment office is here just to help students like you.' }
    ],
    translation: 'Narator: (Melihat opsi jawaban terlebih dahulu)\nPria: Saya sedang mencari pekerjaan paruh waktu di kampus.\nWanita: Kalau begitu kamu datang ke tempat yang tepat. Kantor ketenagakerjaan kampus ada di sini untuk membantu mahasiswa sepertimu.',
    clue: 'Kata-kata yang berulang di opsi ("work", "campus", "employment office", "jobs") langsung mengungkap topik.',
    strategy: 'Gunakan waktu jeda antar-soal untuk memindai opsi jawaban dan membentuk gambaran topik sebelum audio dimulai.',
    question: 'What is the main topic of this conversation?',
    options: [
      '(A) Finding work on campus',
      '(B) Working in the employment office',
      '(C) Helping students change majors',
      '(D) Applying for graduation'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Benar — Pria mencari pekerjaan paruh waktu di kampus.',
      '(B) Salah — Dia tidak melamar bekerja sebagai staf kantor tersebut.',
      '(C) Salah — Tidak membahas pindah jurusan.',
      '(D) Salah — Tidak membahas kelulusan.'
    ]
  },
  {
    num: 19, cat: 'B', page: 'p. 80', title: 'Anticipate the questions (Long Conversations)',
    indonesianTitle: 'Antisipasi Pertanyaan yang Akan Muncul',
    concept: 'Bentuk opsi jawaban memberi petunjuk jelas tentang pertanyaan apa yang akan diajukan (misal: opsi nama tempat → pertanyaan "Where...?", opsi angka/jam → "How long / When...?").',
    formula: 'Opsi Waktu → When? • Opsi Tempat → Where? • Opsi Alasan → Why?',
    dialogue: [
      { speaker: 'Woman', text: 'You can work up to twenty hours a week during the semester, and up to forty hours during vacations.' },
      { speaker: 'Man', text: 'Twenty hours a week during the semester sounds perfect for my schedule.' }
    ],
    translation: 'Wanita: Kamu bisa bekerja hingga dua puluh jam seminggu selama semester berjalan, dan hingga empat puluh jam selama liburan.\nPria: Dua puluh jam seminggu selama semester terdengar pas dengan jadwalku.',
    clue: 'Jika opsi berisi "10 hours / 20 hours / 30 hours / 40 hours", pertanyaannya pasti menanyakan durasi kerja per minggu selama semester.',
    strategy: 'Perhatikan perbedaan antar-opsi untuk mengetahui detail spesifik apa yang harus Anda tangkap.',
    question: 'How many hours a week can the man work during the semester?',
    options: [
      '(A) Up to 10 hours',
      '(B) Up to 20 hours',
      '(C) Up to 30 hours',
      '(D) Up to 40 hours'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Angka tidak disebut.',
      '(B) Benar — 20 jam per minggu selama semester.',
      '(C) Salah — Angka tidak disebut.',
      '(D) Salah — 40 jam berlaku saat liburan ("during vacations").'
    ]
  },
  {
    num: 20, cat: 'B', page: 'p. 82', title: 'Determine the topic (Long Conversations)',
    indonesianTitle: 'Tentukan Topik Utama dari Awal Percakapan',
    concept: 'Topik utama percakapan panjang hampir selalu diperkenalkan dalam satu atau dua kalimat pertama percakapan.',
    formula: '1–2 Kalimat Pertama Percakapan = Ide Pokok / Topik Utama',
    dialogue: [
      { speaker: 'Woman', text: 'Did you hear that the water level in the lake has dropped significantly this summer?' },
      { speaker: 'Man', text: 'Yes, the drought has affected all the reservoirs in the region.' }
    ],
    translation: 'Wanita: Apakah kamu dengar bahwa permukaan air di danau telah turun drastis musim panas ini?\nPria: Ya, kekeringan telah memengaruhi seluruh waduk di wilayah ini.',
    clue: 'Kalimat pembuka langsung menyebutkan penurunan permukaan air danau akibat kekeringan.',
    strategy: 'Jangan lengah di 10 detik pertama percakapan panjang karena ide pokok biasanya langsung dinyatakan di awal.',
    question: 'What are the speakers mainly discussing?',
    options: [
      '(A) Swimming competitions at the lake',
      '(B) The low water level caused by drought',
      '(C) Building a new reservoir',
      '(D) Winter snowfall forecasts'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Tidak membahas kompetisi renang.',
      '(B) Benar — Penurunan level air danau akibat kekeringan.',
      '(C) Salah — Tidak membahas pembangunan waduk baru.',
      '(D) Salah — Konteksnya musim panas, bukan salju musim dingin.'
    ]
  },
  {
    num: 21, cat: 'B', page: 'p. 84', title: 'Draw conclusions about who, what, when, where',
    indonesianTitle: 'Tarik Kesimpulan Siapa, Apa, Kapan, Di Mana dalam Percakapan Panjang',
    concept: 'Sama seperti di Short Dialogues, pertanyaan dalam Long Conversations sering menguji kesimpulan tersirat mengenai identitas pembicara, waktu, atau lokasi.',
    formula: 'Petunjuk Konteks Lintas Giliran Bicara → Kesimpulan Tersirat',
    dialogue: [
      { speaker: 'Man', text: 'I need to return these three reference books before the late fees start adding up.' },
      { speaker: 'Woman', text: 'Just drop them in the book slot at the circulation desk before five o\'clock.' }
    ],
    translation: 'Pria: Saya harus mengembalikan tiga buku referensi ini sebelum denda keterlambatannya terus bertambah.\nWanita: Masukkan saja ke kotak pengembalian buku di meja sirkulasi sebelum jam lima.',
    clue: '"reference books", "late fees", "circulation desk" → Perpustakaan kampus.',
    strategy: 'Hubungkan istilah-istilah spesifik untuk menentukan setting tempat dan waktu.',
    question: 'Where does this conversation probably take place?',
    options: [
      '(A) In a bookstore',
      '(B) In a library',
      '(C) In a bank',
      '(D) In a classroom'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Toko buku tidak memiliki meja sirkulasi dan pengembalian buku referensi.',
      '(B) Benar — Perpustakaan kampus.',
      '(C) Salah — Tidak relevan.',
      '(D) Salah — Tidak relevan.'
    ]
  },
  {
    num: 22, cat: 'B', page: 'p. 86', title: 'Listen for answers in order',
    indonesianTitle: 'Dengarkan Jawaban Secara Berurutan (In Order)',
    concept: 'Pertanyaan-pertanyaan pada Long Conversation disusun secara kronologis mengikuti urutan informasi yang muncul dalam percakapan dari awal hingga akhir.',
    formula: 'Info Awal → Pertanyaan 1 • Info Tengah → Pertanyaan 2 • Info Akhir → Pertanyaan 3',
    dialogue: [
      { speaker: 'Woman', text: 'First, fill out the blue registration form. Second, get your advisor\'s signature. Finally, submit it to the registrar\'s office by Friday.' }
    ],
    translation: 'Wanita: Pertama, isi formulir pendaftaran berwarna biru. Kedua, minta tanda tangan dosen pembimbingmu. Terakhir, serahkan ke kantor registrasi paling lambat hari Jumat.',
    clue: 'Urutan langkah (First → Second → Finally) sesuai dengan urutan pertanyaan.',
    strategy: 'Ikuti alur opsi jawaban dari atas ke bawah seiring berjalannya percakapan.',
    question: 'What is the second step the student must take?',
    options: [
      '(A) Fill out a blue form',
      '(B) Obtain a signature from an advisor',
      '(C) Visit the registrar\'s office',
      '(D) Pay the tuition fee'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Ini adalah langkah pertama ("First").',
      '(B) Benar — "Second, get your advisor\'s signature".',
      '(C) Salah — Ini adalah langkah terakhir ("Finally").',
      '(D) Salah — Tidak disebutkan dalam dialog.'
    ]
  },
  // C. Long Talks (23-27)
  {
    num: 23, cat: 'C', page: 'p. 89', title: 'Anticipate the topics (Long Talks)',
    indonesianTitle: 'Antisipasi Topik Monolog/Kuliah Singkat (Long Talks)',
    concept: 'Dalam PBT Part C (Long Talks), satu pembicara menyampaikan kuliah mini atau pengumuman. Pindai opsi jawaban lebih dulu untuk memprediksi tema kuliah.',
    formula: 'Scan Opsi Jawaban → Identifikasi Bidang Ilmu / Topik Pengumuman',
    dialogue: [
      { speaker: 'Professor', text: 'Today we will examine how the eruption of Mount St. Helens in 1980 reshaped the surrounding ecosystem.' }
    ],
    translation: 'Profesor: Hari ini kita akan menelaah bagaimana letusan Gunung St. Helens pada tahun 1980 membentuk ulang ekosistem di sekitarnya.',
    clue: 'Kata "eruption", "Mount St. Helens", "ecosystem" menunjukkan kuliah geologi/ekologi.',
    strategy: 'Gunakan strategi yang sama dengan Skill 18 untuk memprediksi topik dari pilihan jawaban.',
    question: 'What is the talk mainly about?',
    options: [
      '(A) The ecological impact of a volcanic eruption',
      '(B) How to climb Mount St. Helens',
      '(C) Weather patterns in 1980',
      '(D) Famous mountains in Europe'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Benar — Dampak ekologis dari letusan gunung berapi.',
      '(B) Salah — Tidak membahas pendakian.',
      '(C) Salah — Tidak membahas pola cuaca secara umum.',
      '(D) Salah — Mount St. Helens berada di Amerika Serikat.'
    ]
  },
  {
    num: 24, cat: 'C', page: 'p. 91', title: 'Anticipate the questions (Long Talks)',
    indonesianTitle: 'Antisipasi Pertanyaan pada Long Talks',
    concept: 'Opsi jawaban yang berisi tahun, tanggal, alasan, atau klasifikasi menunjukkan pertanyaan spesifik yang harus Anda nantikan saat pembicara berbicara.',
    formula: 'Opsi Angka/Tahun → Kapan/Berapa • Opsi Proses → Bagaimana/Mengapa',
    dialogue: [
      { speaker: 'Speaker', text: 'The museum tour begins at 9:00 A.M. in the main rotunda, lasts ninety minutes, and concludes in the sculpture garden.' }
    ],
    translation: 'Pembicara: Tur museum dimulai pukul 09.00 pagi di rotunda utama, berlangsung selama sembilan puluh menit, dan berakhir di taman patung.',
    clue: 'Waktu mulai (9:00 A.M.), durasi (90 minutes), dan lokasi akhir (sculpture garden) adalah detail kunci.',
    strategy: 'Tandai kata kunci spesifik di setiap opsi sebelum audio dimulai.',
    question: 'How long does the museum tour last?',
    options: [
      '(A) 30 minutes',
      '(B) 60 minutes',
      '(C) 90 minutes',
      '(D) 120 minutes'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Tidak sesuai.',
      '(B) Salah — Tidak sesuai.',
      '(C) Benar — "lasts ninety minutes" (90 menit).',
      '(D) Salah — Tidak sesuai.'
    ]
  },
  {
    num: 25, cat: 'C', page: 'p. 93', title: 'Determine the topic (Long Talks)',
    indonesianTitle: 'Tentukan Topik Utama dari Pembukaan Kuliah',
    concept: 'Pembicara pada Long Talk hampir selalu menyatakan tesis atau topik kuliah di kalimat pembuka.',
    formula: 'Kalimat Pembuka Kuliah = Topik Utama Pembahasan',
    dialogue: [
      { speaker: 'Lecturer', text: 'Welcome to orientation week. This morning I\'d like to explain how to obtain your student identification card and library privileges.' }
    ],
    translation: 'Pembicara: Selamat datang di pekan orientasi. Pagi ini saya ingin menjelaskan cara mendapatkan kartu identitas mahasiswa dan hak akses perpustakaan.',
    clue: 'Kalimat kedua langsung menjelaskan tujuan pengumuman.',
    strategy: 'Dengarkan kalimat pembuka dengan seksama untuk menjawab pertanyaan "What is the main topic/purpose of the talk?".',
    question: 'What is the purpose of the talk?',
    options: [
      '(A) To explain how to get a student ID and library access',
      '(B) To introduce the university president',
      '(C) To announce final exam schedules',
      '(D) To recruit library volunteers'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Benar — Sesuai pernyataan eksplisit pembicara.',
      '(B) Salah — Tidak disebutkan.',
      '(C) Salah — Tidak disebutkan.',
      '(D) Salah — Tidak disebutkan.'
    ]
  },
  {
    num: 26, cat: 'C', page: 'p. 95', title: 'Draw conclusions about who, what, when, where (Long Talks)',
    indonesianTitle: 'Simpulkan Siapa Pembicara, Audiens, Waktu, dan Lokasi Monolog',
    concept: 'Pertanyaan sering menanyakan "Who is the speaker?", "Who is the audience?", atau "In what course would this lecture be given?".',
    formula: 'Istilah Akademik + Sapaan Pembicara → Identitas Pembicara & Mata Kuliah',
    dialogue: [
      { speaker: 'Speaker', text: 'Before we dissect the specimens on your lab tables, make sure you are wearing protective goggles and gloves.' }
    ],
    translation: 'Pembicara: Sebelum kita membedah spesimen di meja laboratorium kalian, pastikan kalian mengenakan kacamata pelindung dan sarung tangan.',
    clue: '"dissect the specimens", "lab tables", "protective goggles" → Instruktur laboratorium Biologi.',
    strategy: 'Perhatikan sapaan dan instruksi pembicara untuk menyimpulkan konteks kelas atau lokasi.',
    question: 'Who is most likely speaking?',
    options: [
      '(A) A biology lab instructor',
      '(B) A history professor',
      '(C) A hospital patient',
      '(D) A restaurant chef'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Benar — Instruksi membedah spesimen di laboratorium mengarah pada instruktur lab biologi.',
      '(B) Salah — Sejarah tidak melakukan pembedahan spesimen.',
      '(C) Salah — Tidak relevan.',
      '(D) Salah — Tidak relevan.'
    ]
  },
  {
    num: 27, cat: 'C', page: 'p. 97', title: 'Listen for answers in order (Long Talks)',
    indonesianTitle: 'Ikuti Jawaban Secara Berurutan pada Long Talks',
    concept: 'Sama seperti Skill 22, informasi yang diujikan pada Long Talks muncul berurutan dari awal hingga akhir monolog.',
    formula: 'Alur Monolog (Awal → Tengah → Akhir) = Urutan Nomor Soal',
    dialogue: [
      { speaker: 'Professor', text: 'Benjamin Franklin is remembered first as a printer in Philadelphia, later as a scientist experimenting with electricity, and ultimately as a diplomat in France.' }
    ],
    translation: 'Profesor: Benjamin Franklin dikenang pertama-tama sebagai pencetak di Philadelphia, kemudian sebagai ilmuwan yang bereksperimen dengan listrik, dan akhirnya sebagai diplomat di Prancis.',
    clue: 'Urutan kronologis karier Franklin: printer → scientist → diplomat.',
    strategy: 'Gunakan urutan waktu atau tahapan yang disebut pembicara sebagai penanda posisi soal.',
    question: 'What was Benjamin Franklin\'s final role mentioned in the lecture?',
    options: [
      '(A) A printer in Philadelphia',
      '(B) A scientist studying electricity',
      '(C) A diplomat in France',
      '(D) A university founder'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Ini peran pertama ("first").',
      '(B) Salah — Ini peran kedua ("later").',
      '(C) Benar — "ultimately as a diplomat in France".',
      '(D) Salah — Tidak disebutkan dalam kutipan ini.'
    ]
  },
  // D. Casual Conversations (28)
  {
    num: 28, cat: 'D', page: 'p. 100', title: 'Understand casual conversations (CBT Format)',
    indonesianTitle: 'Pahami Percakapan Kasual Mahasiswa (Format CBT)',
    concept: 'Pada format Computer-Based TOEFL (CBT), bagian ini menampilkan percakapan informal antara mahasiswa di kampus disertai gambar konteks suasana kampus.',
    formula: 'Konteks Kampus Santai + Idiom Mahasiswa + Nada Emosi Pembicara',
    dialogue: [
      { speaker: 'Student 1', text: 'I\'ve been staring at this calculus problem set for two hours and I\'m getting nowhere.' },
      { speaker: 'Student 2', text: 'Why don\'t we take a ten-minute coffee break at the student union and then tackle it together?' },
      { speaker: 'Student 1', text: 'That sounds like a lifesaver!' }
    ],
    translation: 'Mahasiswa 1: Saya sudah memelototi soal kalkulus ini selama dua jam dan tidak ada kemajuan sama sekali.\nMahasiswa 2: Bagaimana kalau kita istirahat minum kopi sepuluh menit di student union lalu mengerjakannya bersama?\nMahasiswa 1: Kedengarannya seperti penyelamat hidup!',
    clue: '"getting nowhere" = tidak membuat kemajuan; "lifesaver" = bantuan yang sangat melegakan.',
    strategy: 'Perhatikan ekspresi idiomatik informal mahasiswa serta solusi yang disepakati di akhir percakapan.',
    question: 'What will the two students probably do next?',
    options: [
      '(A) Drop their calculus class',
      '(B) Take a short break for coffee before studying together',
      '(C) Ask the professor to cancel the assignment',
      '(D) Go home and sleep'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Tidak ada rencana keluar dari kelas.',
      '(B) Benar — Mereka sepakat istirahat kopi 10 menit lalu mengerjakan bersama.',
      '(C) Salah — Tidak disebutkan.',
      '(D) Salah — Tidak disebutkan.'
    ]
  },
  // E. Academic Discussions (29-31)
  {
    num: 29, cat: 'E', page: 'p. 110', title: 'Recognize the organization (Academic Discussions)',
    indonesianTitle: 'Kenali Pola Organisasi Diskusi Akademik (Classification vs Process)',
    concept: 'Diskusi akademik CBT umumnya terorganisasi dalam dua pola utama: (1) Classification/Categorization (membagi topik ke dalam beberapa jenis, contoh: Jenis Batuan atau Periode Musik) atau (2) Process/Chronological (urutan tahapan dari waktu ke waktu, contoh: Proses Pengolahan Biji Kakao / Cacao Tree).',
    formula: 'Pola 1: Classification (Jenis A, B, C) • Pola 2: Process / Chronological (Tahap 1 → 2 → 3)',
    visualType: 'discussion-org',
    dialogue: [
      { speaker: 'Professor', text: 'Today let\'s trace how chocolate is produced from the cacao tree. First, the pods are harvested and split open. Next, the beans undergo fermentation for several days, followed by drying and roasting.' },
      { speaker: 'Student', text: 'And after roasting, the shells are removed to leave the cacao nibs, right?' },
      { speaker: 'Professor', text: 'Exactly. Those nibs are then ground into chocolate liquor.' }
    ],
    translation: 'Profesor: Hari ini mari kita telusuri bagaimana cokelat diproduksi dari pohon kakao. Pertama, buah kakao dipanen dan dibelah. Selanjutnya, biji mengalami fermentasi selama beberapa hari, diikuti pengeringan dan pemanggangan.\nMahasiswa: Dan setelah dipanggang, kulitnya dibuang menyisakan nibs kakao, benar?\nProfesor: Tepat sekali. Nibs tersebut kemudian digiling menjadi pasta cokelat.',
    clue: 'Penanda urutan: "First... Next... followed by... after roasting... then..." menunjukkan pola Process/Chronological.',
    strategy: 'Perhatikan kata transisi apakah pembicara sedang mengelompokkan kategori (types/kinds) atau mengurutkan tahapan waktu (first/next/finally).',
    question: 'How is the information in this discussion organized?',
    options: [
      '(A) By comparing chocolate prices across countries',
      '(B) By tracing the chronological steps in processing cacao beans',
      '(C) By classifying different species of tropical trees',
      '(D) By arguing against chocolate consumption'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Tidak membahas harga.',
      '(B) Benar — Urutan tahapan pemrosesan biji kakao dari panen hingga penggilingan.',
      '(C) Salah — Fokusnya proses pengolahan kakao, bukan klasifikasi spesies pohon.',
      '(D) Salah — Tidak bersifat argumentatif negatif.'
    ]
  },
  {
    num: 30, cat: 'E', page: 'p. 119', title: 'Listen for direct and indirect details (Academic Discussions)',
    indonesianTitle: 'Tangkap Detail Langsung dan Tidak Langsung dalam Diskusi',
    concept: 'Dalam diskusi kelas antara profesor dan beberapa mahasiswa, detail penting sering kali muncul dari pertanyaan atau tanggapan mahasiswa yang kemudian dikonfirmasi atau dikoreksi oleh profesor.',
    formula: 'Pertanyaan Mahasiswa + Konfirmasi/Koreksi Profesor = Kunci Detail Soal',
    dialogue: [
      { speaker: 'Professor', text: 'When classifying rocks, geologists look at how they were formed. Igneous rocks form from cooled magma.' },
      { speaker: 'Student 1', text: 'So granite and basalt are both igneous, even though granite cools slowly underground and basalt cools quickly on the surface?' },
      { speaker: 'Professor', text: 'Precisely. That difference in cooling rate explains why granite has large crystals while basalt is fine-grained.' }
    ],
    translation: 'Profesor: Saat mengklasifikasikan batuan, ahli geologi melihat cara terbentuknya. Batuan beku terbentuk dari magma yang mendingin.\nMahasiswa 1: Jadi granit dan basal keduanya batuan beku, meskipun granit mendingin lambat di bawah tanah dan basal mendingin cepat di permukaan?\nProfesor: Tepat sekali. Perbedaan laju pendinginan itu menjelaskan mengapa granit memiliki kristal besar sedangkan basal berbutir halus.',
    clue: 'Perbandingan granit (pendinginan lambat → kristal besar) vs basal (pendinginan cepat → butir halus).',
    strategy: 'Buat catatan mental perbandingan dua konsep yang dibahas bergantian oleh profesor dan mahasiswa.',
    question: 'Why does granite have larger crystals than basalt?',
    options: [
      '(A) Because granite is a sedimentary rock',
      '(B) Because granite cools slowly beneath the Earth\'s surface',
      '(C) Because basalt contains no minerals',
      '(D) Because granite forms during volcanic explosions in the ocean'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Granit adalah batuan beku (igneous), bukan sedimen.',
      '(B) Benar — Pendinginan lambat di bawah permukaan menghasilkan kristal besar.',
      '(C) Salah — Basal tetap tersusun dari mineral, hanya berbutir halus.',
      '(D) Salah — Bertentangan dengan penjelasan profesor.'
    ]
  },
  {
    num: 31, cat: 'E', page: 'p. 127', title: 'Visualize the passage (Academic Discussions)',
    indonesianTitle: 'Visualisasikan Isi Diskusi (Bagan, Peta, atau Skema)',
    concept: 'Banyak diskusi akademik membahas struktur fisik, jalur orbit, atau periode sejarah (misalnya komponen Space Shuttle atau pembagian Periode Musik Baroque, Classical, Romantic) yang mudah dipahami jika divisualisasikan.',
    formula: 'Deskripsi Verbal → Skema Visual / Bagan Komponen',
    dialogue: [
      { speaker: 'Professor', text: 'The Space Shuttle system consists of three main components: the winged orbiter that carries the crew, the large rust-colored external fuel tank, and two white solid rocket boosters attached to the sides.' }
    ],
    translation: 'Profesor: Sistem Pesawat Ulang-Alik (Space Shuttle) terdiri dari tiga komponen utama: orbiter bersayap yang membawa awak, tangki bahan bakar eksternal besar berwarna karat, dan dua pendorong roket padat berwarna putih yang menempel di sisi-sisinya.',
    clue: '3 komponen: (1) Winged orbiter (awak), (2) External tank (bahan bakar), (3) Two solid rocket boosters (daya dorong awal).',
    strategy: 'Bayangkan gambar atau tabel di kepala Anda saat profesor menjelaskan bagian-bagian objek atau lini masa.',
    question: 'Which component of the Space Shuttle carries the astronauts?',
    options: [
      '(A) The external fuel tank',
      '(B) The solid rocket boosters',
      '(C) The winged orbiter',
      '(D) The launch pad tower'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Menyimpan bahan bakar.',
      '(B) Salah — Memberikan daya dorong roket padat.',
      '(C) Benar — "the winged orbiter that carries the crew".',
      '(D) Salah — Bukan komponen pesawat.'
    ]
  },
  // F. Academic Lectures (32-34)
  {
    num: 32, cat: 'F', page: 'p. 140', title: 'Recognize the organization (Academic Lectures)',
    indonesianTitle: 'Kenali Struktur Organisasi Kuliah Akademik (Academic Lectures)',
    concept: 'Kuliah akademik CBT berdurasi lebih panjang dan mengikuti kerangka terstruktur: Pengenalan Topik → Pembagian Subtopik/Teori → Bukti/Contoh → Kesimpulan.',
    formula: 'Intro Tesis → Subtopik 1 + Contoh → Subtopik 2 + Contoh → Sintesis',
    visualType: 'lecture-org',
    dialogue: [
      { speaker: 'Professor', text: 'In today\'s psychology lecture, we will compare two major theories of memory: the multi-store model proposed by Atkinson and Shiffrin, and the levels-of-processing framework introduced by Craik and Lockhart.' }
    ],
    translation: 'Profesor: Dalam kuliah psikologi hari ini, kita akan membandingkan dua teori utama memori: model multi-simpan yang diajukan Atkinson dan Shiffrin, serta kerangka tingkat pemrosesan yang diperkenalkan Craik dan Lockhart.',
    clue: 'Kata "compare two major theories" menandakan organisasi perbandingan dua kerangka teori.',
    strategy: 'Gunakan kalimat pengantar profesor sebagai peta jalan (roadmap) seluruh kuliah.',
    question: 'What is the overall organization of this lecture?',
    options: [
      '(A) A chronological biography of a single psychologist',
      '(B) A comparison of two major theories of human memory',
      '(C) A step-by-step guide to memorizing vocabulary',
      '(D) A history of computer hard drives'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Membahas dua teori dari dua pasangan peneliti berbeda.',
      '(B) Benar — Perbandingan dua teori utama memori.',
      '(C) Salah — Bersifat teoretis akademik, bukan tips praktis.',
      '(D) Salah — Psikologi memori manusia, bukan perangkat keras komputer.'
    ]
  },
  {
    num: 33, cat: 'F', page: 'p. 149', title: 'Listen for direct and indirect details (Academic Lectures)',
    indonesianTitle: 'Tangkap Detail Eksplisit & Implisit dalam Kuliah Akademik',
    concept: 'Soal kuliah akademik menguji definisi istilah teknis yang dijelaskan profesor serta implikasi logis dari contoh yang diberikan.',
    formula: 'Istilah Teknis + Definisi / Contoh Profesor → Pertanyaan Detail & Inferensi',
    dialogue: [
      { speaker: 'Professor', text: 'Unlike warm-blooded mammals that generate internal body heat, ectothermic reptiles rely on external heat sources—such as basking in sunlight—to regulate their body temperature.' }
    ],
    translation: 'Profesor: Tidak seperti mamalia berdarah panas yang menghasilkan panas tubuh internal, reptil ektotermik bergantung pada sumber panas eksternal—seperti berjemur di bawah sinar matahari—untuk mengatur suhu tubuh mereka.',
    clue: 'Ectothermic = bergantung pada sumber panas eksternal (misal sinar matahari).',
    strategy: 'Catat definisi yang diawali frasa seperti "that is", "in other words", atau kontras "unlike...".',
    question: 'How do ectothermic reptiles regulate their body temperature?',
    options: [
      '(A) By generating constant internal metabolic heat',
      '(B) By using external heat sources like sunlight',
      '(C) By hibernating throughout the summer',
      '(D) By living exclusively in polar oceans'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Itu ciri mamalia berdarah panas.',
      '(B) Benar — Menggunakan sumber panas eksternal seperti sinar matahari.',
      '(C) Salah — Tidak disebutkan.',
      '(D) Salah — Tidak relevan.'
    ]
  },
  {
    num: 34, cat: 'F', page: 'p. 157', title: 'Visualize the passage (Academic Lectures)',
    indonesianTitle: 'Visualisasikan Proses & Diagram Kuliah Akademik',
    concept: 'Dalam CBT, pertanyaan kuliah sering meminta Anda mengurutkan tahapan proses alam/sejarah atau mencocokkan ciri ke dalam tabel kategori.',
    formula: 'Tahapan Proses / Kategori Ciri → Pemetaan Urutan & Matriks Kategori',
    dialogue: [
      { speaker: 'Professor', text: 'During the water cycle, solar radiation causes evaporation from oceans. As water vapor rises and cools, condensation forms clouds. Eventually, precipitation returns water to the Earth\'s surface.' }
    ],
    translation: 'Profesor: Selama siklus air, radiasi matahari menyebabkan evaporasi (penguapan) dari lautan. Saat uap air naik dan mendingin, kondensasi membentuk awan. Akhirnya, presipitasi (hujan) mengembalikan air ke permukaan Bumi.',
    clue: 'Urutan siklus: Evaporation → Condensation → Precipitation.',
    strategy: 'Susun kata kunci proses dalam panah berurutan: A → B → C.',
    question: 'What is the correct sequence of stages in the water cycle described by the professor?',
    options: [
      '(A) Condensation → Evaporation → Precipitation',
      '(B) Precipitation → Condensation → Evaporation',
      '(C) Evaporation → Condensation → Precipitation',
      '(D) Evaporation → Precipitation → Condensation'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Urutan terbalik di awal.',
      '(B) Salah — Urutan mundur.',
      '(C) Benar — Penguapan (evaporation), pengembunan (condensation), lalu hujan (precipitation).',
      '(D) Salah — Kondensasi terjadi sebelum presipitasi.'
    ]
  }
];

// ============================================================================
// 3. STRUCTURE MASTERCLASS DATA (ALL 60 SKILLS, pp. 198–330)
// ============================================================================

const STRUCTURE_GROUPS = [
  { id: 'A', name: 'A. Sentences with One Clause', range: 'Skills 1–5', pages: 'pp. 200–208' },
  { id: 'B', name: 'B. Sentences with Multiple Clauses', range: 'Skills 6–8', pages: 'pp. 209–216' },
  { id: 'C', name: 'C. More Sentences with Multiple Clauses', range: 'Skills 9–12', pages: 'pp. 217–226' },
  { id: 'D', name: 'D. Sentences with Reduced Clauses', range: 'Skills 13–14', pages: 'pp. 227–234' },
  { id: 'E', name: 'E. Sentences with Inverted Subjects & Verbs', range: 'Skills 15–19', pages: 'pp. 235–246' },
  { id: 'F', name: 'F. Problems with Subject/Verb Agreement', range: 'Skills 20–23', pages: 'pp. 248–255' },
  { id: 'G', name: 'G. Problems with Parallel Structure', range: 'Skills 24–26', pages: 'pp. 256–261' },
  { id: 'H', name: 'H. Problems with Comparatives & Superlatives', range: 'Skills 27–29', pages: 'pp. 262–268' },
  { id: 'I', name: 'I. Problems with the Form of the Verb', range: 'Skills 30–32', pages: 'pp. 269–273' },
  { id: 'J', name: 'J. Problems with the Use of the Verb', range: 'Skills 33–36', pages: 'pp. 274–281' },
  { id: 'K', name: 'K. Problems with Passive Verbs', range: 'Skills 37–38', pages: 'pp. 282–286' },
  { id: 'L', name: 'L. Problems with Nouns', range: 'Skills 39–42', pages: 'pp. 287–293' },
  { id: 'M', name: 'M. Problems with Pronouns', range: 'Skills 43–45', pages: 'pp. 294–300' },
  { id: 'N', name: 'N. Problems with Adjectives and Adverbs', range: 'Skills 46–48', pages: 'pp. 301–307' },
  { id: 'O', name: 'O. More Problems with Adjectives', range: 'Skills 49–51', pages: 'pp. 308–313' },
  { id: 'P', name: 'P. Problems with Articles', range: 'Skills 52–55', pages: 'pp. 314–320' },
  { id: 'Q', name: 'Q. Problems with Prepositions', range: 'Skills 56–57', pages: 'pp. 321–324' },
  { id: 'R', name: 'R. Problems with Usage', range: 'Skills 58–60', pages: 'pp. 325–330' }
];

const RAW_STRUCTURE_SKILLS = [
  // Group A: Sentences with One Clause (1-5)
  {
    num: 1, group: 'A', page: 'p. 200', title: 'Be sure the sentence has a Subject and a Verb',
    indonesianTitle: 'Pastikan Kalimat Memiliki Subject dan Verb',
    objective: 'Mengidentifikasi kelengkapan unsur inti kalimat tunggal (Subject dan Verb) serta menghindari kalimat tanpa Subject, tanpa Verb, atau memiliki Subject/Verb ganda.',
    explanation: 'Setiap kalimat lengkap dalam bahasa Inggris wajib memiliki minimal satu Subject (pelaku/topik) dan satu Verb (kata kerja utama). Soal TOEFL Structure sangat sering menghilangkan Subject, menghilangkan Verb, atau menyisipkan kata tambahan yang membuat Subject/Verb menjadi ganda.',
    formula: '[Subject] + [Verb] + (Object / Complement)',
    exampleEn: 'The boy going to the movies with a friend → (SALAH: kurang Verb) | The boy is going to the movies with a friend → (BENAR)',
    exampleId: 'Anak laki-laki itu sedang pergi ke bioskop bersama seorang teman. (Kata "going" saja tanpa "is" bukanlah Verb lengkap).',
    tokens: [
      { text: 'The engineers', role: 'Subject' },
      { text: 'at the lab', role: 'PrepPhrase' },
      { text: 'designed', role: 'Verb' },
      { text: 'a new solar battery.', role: 'Clause' }
    ],
    commonMistake: 'Menganggap V-ing (going) atau To-V1 (to go) sebagai Verb utama tanpa kata kerja bantu (auxiliary).',
    strategy: 'Langkah pertama saat melihat soal Structure: cari Subject dan Verb utamanya terlebih dahulu sebelum melihat kata keterangan.',
    relatedSkills: ['Skill 2', 'Skill 20'],
    questionType: 'Structure (Completion)',
    question: '_______ was backed up for miles on the freeway.',
    options: [
      '(A) Yesterday',
      '(B) In the morning',
      '(C) Traffic',
      '(D) Cars'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — "Yesterday" adalah keterangan waktu, bukan Subject.',
      '(B) Salah — "In the morning" adalah Prepositional Phrase, tidak bisa menjadi Subject.',
      '(C) Benar — "Traffic" adalah Subject tunggal yang cocok dengan Verb tunggal "was backed up".',
      '(D) Salah — "Cars" jamak, sedangkan Verb-nya tunggal ("was").'
    ]
  },
  {
    num: 2, group: 'A', page: 'p. 201', title: 'Be careful of objects of prepositions',
    indonesianTitle: 'Hati-hati dengan Object of Preposition (Bukan Subject!)',
    objective: 'Membedakan Object of Preposition (kata benda setelah preposisi seperti in, on, at, of, to, by, with) agar tidak keliru dianggap sebagai Subject kalimat.',
    explanation: 'Object of Preposition adalah kata benda atau kata ganti yang muncul setelah kata depan (preposition). Frasa preposisi (Prepositional Phrase) TIDAK PERNAH bisa berfungsi sebagai Subject kalimat.',
    formula: '[Preposition + Noun = Object of Preposition (BUKAN Subject)] + [Subject] + [Verb]',
    exampleEn: 'With his friend found the movie theater → (SALAH: "his friend" adalah objek dari "With", kalimat tidak punya Subject!)',
    exampleId: 'Bersama temannya [dia] menemukan bioskop itu. Karena "With his friend" adalah prepositional phrase, kalimat membutuhkan Subject seperti "he".',
    tokens: [
      { text: 'To Mike', role: 'PrepPhrase' },
      { text: 'the party', role: 'Subject' },
      { text: 'was', role: 'Verb' },
      { text: 'a big surprise.', role: 'Clause' }
    ],
    commonMistake: 'Tertipu oleh kata benda di awal kalimat yang didahului preposisi (mis. "In the box...", "For the students...").',
    strategy: 'Coret secara mental semua Prepositional Phrase (Preposition + Noun) di awal atau tengah kalimat untuk melihat Subject dan Verb aslinya.',
    relatedSkills: ['Skill 1', 'Skill 20'],
    questionType: 'Structure (Completion)',
    question: 'With his friend _______ found the movie theater.',
    options: [
      '(A) has',
      '(B) he',
      '(C) later',
      '(D) when'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Menambah Verb tanpa ada Subject.',
      '(B) Benar — "he" mengisi posisi Subject sebelum Verb "found".',
      '(C) Salah — Keterangan waktu, bukan Subject.',
      '(D) Salah — Connector "when" membutuhkan klausa kedua.'
    ]
  },
  {
    num: 3, group: 'A', page: 'p. 203', title: 'Be careful of appositives',
    indonesianTitle: 'Hati-hati dengan Appositive (Keterangan Tambahan Apresiatif)',
    objective: 'Mengenali Appositive sebagai frasa kata benda yang menjelaskan kata benda lain dan dipisahkan tanda koma, bukan sebagai Subject kedua.',
    explanation: 'Appositive adalah kata benda atau frasa benda yang muncul sebelum atau sesudah kata benda lain dan memiliki makna yang sama (memberi informasi tambahan), biasanya diapit oleh koma. Appositive BUKAN Subject.',
    formula: '[Subject], [Appositive], [Verb]  ATAU  [Appositive], [Subject] [Verb]',
    exampleEn: 'Sally, the best student in the class, got an A on the exam.',
    exampleId: 'Sally, siswi terbaik di kelas, mendapat nilai A pada ujian. ("the best student in the class" adalah Appositive).',
    tokens: [
      { text: 'George,', role: 'Subject' },
      { text: 'my closest friend,', role: 'Clause' },
      { text: 'is attending', role: 'Verb' },
      { text: 'the lecture.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Mengira frasa di antara dua koma adalah Subject atau menambahkan Verb di dalam Appositive.',
    strategy: 'Jika melihat koma di awal kalimat atau dua koma mengapit frasa benda, periksa apakah kalimat sudah memiliki Subject utama.',
    relatedSkills: ['Skill 1', 'Skill 4', 'Skill 14'],
    questionType: 'Structure (Completion)',
    question: '_______, George, is attending the lecture.',
    options: [
      '(A) Right now',
      '(B) Happily',
      '(C) Because of the time',
      '(D) My friend'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — Keterangan waktu, tidak membentuk appositive dengan "George".',
      '(B) Salah — Adverb, bukan noun phrase appositive.',
      '(C) Salah — Prepositional phrase, bukan appositive.',
      '(D) Benar — "My friend" adalah Appositive di awal kalimat yang menjelaskan Subject "George".'
    ]
  },
  {
    num: 4, group: 'A', page: 'p. 204', title: 'Be careful of present participles',
    indonesianTitle: 'Bedakan Present Participle (V-ing) sebagai Adjective vs Verb',
    objective: 'Membedakan V-ing yang berfungsi sebagai kata sifat (Adjective) dengan V-ing yang merupakan bagian dari Verb (didahului "be").',
    explanation: 'Present Participle adalah bentuk Verb + -ing. Jika didahului "be" (am, is, are, was, were), ia adalah bagian dari Verb. Jika TIDAK didahului "be", ia berfungsi sebagai Adjective yang menerangkan kata benda.',
    formula: 'be + V-ing = Verb  |  V-ing (tanpa be) = Adjective',
    exampleEn: 'The man talking to his friend has a beard. ("talking" = Adjective; "has" = Verb utama)',
    exampleId: 'Pria yang sedang berbicara dengan temannya itu berjenggot.',
    tokens: [
      { text: 'The child', role: 'Subject' },
      { text: 'playing in the yard', role: 'Clause' },
      { text: 'is', role: 'Verb' },
      { text: 'my son.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Memilih jawaban berpola "be + V-ing" padahal kalimat sudah memiliki Verb utama lain.',
    strategy: 'Cek apakah kalimat sudah punya Verb utama. Jika sudah ada Verb utama, V-ing yang dibutuhkan adalah Adjective (tanpa "be").',
    relatedSkills: ['Skill 1', 'Skill 5', 'Skill 14'],
    questionType: 'Structure (Completion)',
    question: 'The child _______ playing in the yard is my son.',
    options: [
      '(A) now',
      '(B) is',
      '(C) he',
      '(D) was'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Benar — Kalimat sudah punya Verb utama ("is my son"), sehingga "playing" adalah adjective dan hanya butuh adverb "now".',
      '(B) Salah — Jika menambah "is", kalimat akan memiliki dua Verb ("is playing" dan "is") tanpa connector.',
      '(C) Salah — Menambah Subject ganda.',
      '(D) Salah — Menambah Verb ganda.'
    ]
  },
  {
    num: 5, group: 'A', page: 'p. 206', title: 'Be careful of past participles',
    indonesianTitle: 'Bedakan Past Participle (V3) sebagai Adjective vs Verb',
    objective: 'Membedakan bentuk Verb-3 (Past Participle) yang berfungsi sebagai Adjective (bermakna pasif) dengan Verb utama (Simple Past atau have/be + V3).',
    explanation: 'Past Participle (V3) dapat menjadi bagian dari Verb jika didahului "have/has/had" (aktif) atau "be" (pasif). Jika berdiri sendiri tanpa "have/be", V3 berfungsi sebagai Adjective.',
    formula: 'have/be + V3 = Verb  |  V3 (tanpa have/be) = Adjective (Makna Pasif)',
    exampleEn: 'The television purchased yesterday was expensive. ("purchased" = Adjective; "was" = Verb)',
    exampleId: 'Televisi yang dibeli kemarin itu mahal.',
    tokens: [
      { text: 'The packages', role: 'Subject' },
      { text: 'mailed at the post office', role: 'Clause' },
      { text: 'will arrive', role: 'Verb' },
      { text: 'Monday.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Bingung antara V2 (Simple Past) dan V3 (Past Participle Adjective) pada kata kerja beraturan berakhiran -ed.',
    strategy: 'Jika sudah ada Verb utama di belakang kalimat, bentuk -ed di tengah kalimat adalah Past Participle Adjective (jangan tambah "were/was").',
    relatedSkills: ['Skill 1', 'Skill 4', 'Skill 14'],
    questionType: 'Structure (Completion)',
    question: 'The packages _______ mailed at the post office will arrive Monday.',
    options: [
      '(A) have',
      '(B) were',
      '(C) them',
      '(D) just'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — "have mailed" menciptakan Verb ganda dengan "will arrive".',
      '(B) Salah — "were mailed" menciptakan Verb ganda.',
      '(C) Salah — Pronoun "them" tidak gramatikal di posisi ini.',
      '(D) Benar — Adverb "just" menerangkan participle adjective "mailed", sedangkan Verb utamanya adalah "will arrive".'
    ]
  },
  // Group B: Sentences with Multiple Clauses (6-8)
  {
    num: 6, group: 'B', page: 'p. 209', title: 'Use coordinate connectors correctly',
    indonesianTitle: 'Gunakan Coordinate Connectors (and, but, or, so, yet) dengan Benar',
    objective: 'Menghubungkan dua klausa setara menggunakan koma + coordinate connector (FANBOYS: for, and, nor, but, or, yet, so).',
    explanation: 'Ketika sebuah kalimat memiliki dua klausa (masing-masing punya Subject dan Verb), keduanya harus dihubungkan dengan benar. Coordinate connector (and, but, or, so, yet) diletakkan DI TENGAH di antara kedua klausa, didahului tanda koma.',
    formula: '[Subject + Verb], + [and / but / or / so / yet] + [Subject + Verb]',
    exampleEn: 'Tom is singing, and Paul is dancing. | Tom is tall, but Paul is short.',
    exampleId: 'Tom sedang bernyanyi, dan Paul sedang menari.',
    tokens: [
      { text: 'A power failure', role: 'Subject' },
      { text: 'occurred,', role: 'Verb' },
      { text: 'so', role: 'Connector' },
      { text: 'the lamps', role: 'Subject' },
      { text: 'went out.', role: 'Verb' }
    ],
    commonMistake: 'Menghubungkan dua klausa hanya dengan tanda koma tanpa connector (comma splice), atau menaruh "so/but" di awal kalimat.',
    strategy: 'Hitung jumlah klausa (S+V). Jika ada 2 klausa, wajib ada 1 connector!',
    relatedSkills: ['Skill 7', 'Skill 8'],
    questionType: 'Structure (Completion)',
    question: 'A power failure occurred, _______ the lamps went out.',
    options: [
      '(A) then',
      '(B) so',
      '(C) later',
      '(D) next'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — "then" adalah adverb, bukan coordinate connector.',
      '(B) Benar — "so" adalah coordinate connector yang menghubungkan sebab-akibat dua klausa.',
      '(C) Salah — Adverb waktu.',
      '(D) Salah — Adverb urutan.'
    ]
  },
  {
    num: 7, group: 'B', page: 'p. 211', title: 'Use adverb time and cause connectors correctly',
    indonesianTitle: 'Gunakan Adverb Time & Cause Connectors dengan Benar',
    objective: 'Menghubungkan klausa utama dan anak kalimat waktu/sebab (after, before, when, while, since, until, because, as, since).',
    explanation: 'Adverb time & cause connectors dapat diletakkan di tengah kalimat (tanpa koma) ATAU di awal kalimat (dengan koma pemisah antar-klausa).',
    formula: '[S + V] + [Connector] + [S + V]   ATAU   [Connector] + [S + V], + [S + V]',
    exampleEn: 'Teresa went inside because it was raining. | Because it was raining, Teresa went inside.',
    exampleId: 'Teresa masuk ke dalam karena hari sedang hujan.',
    tokens: [
      { text: 'Because', role: 'Connector' },
      { text: 'she', role: 'Subject' },
      { text: 'was tired,', role: 'Verb' },
      { text: 'she', role: 'Subject' },
      { text: 'went to bed.', role: 'Verb' }
    ],
    commonMistake: 'Memasang connector (misalnya "Because" atau "When") tetapi melupakan Subject atau Verb pada salah satu klausa.',
    strategy: 'Pastikan setiap connector diikuti klausa lengkap (Subject + Verb) dan ada klausa utama (Subject + Verb).',
    relatedSkills: ['Skill 6', 'Skill 8', 'Skill 13'],
    questionType: 'Structure (Completion)',
    question: '_______ was late, I missed the appointment.',
    options: [
      '(A) I',
      '(B) Because',
      '(C) The train',
      '(D) Since he'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — Menghasilkan 2 klausa tanpa connector ("I was late, I missed...").',
      '(B) Salah — Klausa pertama kehilangan Subject setelah "Because".',
      '(C) Salah — Menghasilkan 2 klausa tanpa connector.',
      '(D) Benar — Menyediakan connector "Since" sekaligus Subject "he" untuk Verb "was late".'
    ]
  },
  {
    num: 8, group: 'B', page: 'p. 213', title: 'Use other adverb connectors correctly',
    indonesianTitle: 'Gunakan Adverb Connectors Lainnya (Condition, Contrast, Manner, Place)',
    objective: 'Menggunakan penghubung keterangan syarat (if, unless, provided), pertentangan (although, even though, though, while, whereas), cara (as, in that), dan tempat (where, wherever).',
    explanation: 'Sama seperti Skill 7, adverb connectors untuk syarat, kontras, cara, dan tempat dapat berada di tengah kalimat maupun di awal kalimat (dengan koma).',
    formula: '[S + V] + [although / if / unless / whereas] + [S + V]',
    exampleEn: 'Bob went to school even though he felt sick. | Even though Bob felt sick, he went to school.',
    exampleId: 'Bob tetap pergi ke sekolah meskipun dia merasa sakit.',
    tokens: [
      { text: 'You', role: 'Subject' },
      { text: 'will get a good grade', role: 'Verb' },
      { text: 'provided', role: 'Connector' },
      { text: 'you', role: 'Subject' },
      { text: 'study.', role: 'Verb' }
    ],
    commonMistake: 'Menggabungkan "Although" dan "but" dalam satu kalimat yang sama.',
    strategy: 'Perhatikan hubungan logis antar-klausa (kontras vs syarat) saat memilih jenis connector.',
    relatedSkills: ['Skill 7', 'Skill 13'],
    questionType: 'Structure (Completion)',
    question: 'You will get a good grade on the exam provided _______.',
    options: [
      '(A) studying',
      '(B) study',
      '(C) to study',
      '(D) you study'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — "provided" adalah adverb connector yang butuh Subject + Verb, bukan V-ing.',
      '(B) Salah — Kurang Subject.',
      '(C) Salah — Infinitive tidak bisa menggantikan klausa lengkap.',
      '(D) Benar — "you study" melengkapi Subject + Verb setelah connector "provided".'
    ]
  },
  // Group C: More Sentences with Multiple Clauses (9-12)
  {
    num: 9, group: 'C', page: 'p. 217', title: 'Use noun clause connectors correctly',
    indonesianTitle: 'Gunakan Noun Clause Connectors dengan Benar',
    objective: 'Menggunakan kata hubung Noun Clause (what, when, where, why, how, whether, if, that) sebagai objek kata kerja, objek preposisi, atau subjek kalimat.',
    explanation: 'Noun Clause adalah anak kalimat yang berfungsi sebagai kata benda (bisa menjadi Subject atau Object). Urutan kata di dalam Noun Clause selalu Subject + Verb (bukan bentuk pertanyaan!).',
    formula: '[S + V] + [what/that/whether/how + S + V]  ATAU  [That/What + S + V] + [V]',
    exampleEn: 'I know when he will arrive. (Noun Clause sebagai Object) | When he will arrive is not important. (Noun Clause sebagai Subject)',
    exampleId: 'Saya tahu kapan dia akan tiba.',
    tokens: [
      { text: 'Why', role: 'Connector' },
      { text: 'the dinosaurs', role: 'Subject' },
      { text: 'became extinct', role: 'Verb' },
      { text: 'is', role: 'Verb' },
      { text: 'still debated.', role: 'Clause' }
    ],
    commonMistake: 'Memakai susunan kalimat tanya setelah connector (mis. "I don\'t know where is he" → SALAH; yang benar "where he is").',
    strategy: 'Pastikan setelah noun clause connector urutannya adalah Subject + Verb, bukan Verb + Subject.',
    relatedSkills: ['Skill 10', 'Skill 15'],
    questionType: 'Structure (Completion)',
    question: '_______ was late caused many problems.',
    options: [
      '(A) That he',
      '(B) The driver',
      '(C) There',
      '(D) Because'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Benar — "That he was late" adalah Noun Clause yang berfungsi sebagai Subject untuk Verb utama "caused".',
      '(B) Salah — "The driver was late caused..." memiliki 2 Verb tanpa connector.',
      '(C) Salah — Tidak membentuk klausa subjek yang valid.',
      '(D) Salah — "Because" membentuk adverb clause, bukan noun clause subjek.'
    ]
  },
  {
    num: 10, group: 'C', page: 'p. 219', title: 'Use noun clause connector/subjects correctly',
    indonesianTitle: 'Gunakan Noun Clause Connector/Subjects (who, whoever, what, whatever, which)',
    objective: 'Menggunakan kata hubung (who, whoever, what, whatever, which, whichever) yang sekaligus berperan sebagai Subject di dalam Noun Clause.',
    explanation: 'Dalam kasus tertentu, kata hubung Noun Clause seperti "who" atau "what" tidak hanya menghubungkan klausa, tetapi juga langsung menjadi Subject bagi kata kerja di dalam klausa tersebut.',
    formula: '[S + V] + [who / what / whatever (Connector sekaligus Subject) + V]',
    exampleEn: 'I do not know what is in the box. | Whoever is coming to the party must bring a gift.',
    exampleId: 'Saya tidak tahu apa yang ada di dalam kotak itu.',
    tokens: [
      { text: 'Whoever', role: 'Connector' },
      { text: 'is coming', role: 'Verb' },
      { text: 'to the party', role: 'PrepPhrase' },
      { text: 'must bring', role: 'Verb' },
      { text: 'a gift.', role: 'Clause' }
    ],
    commonMistake: 'Menambahkan Subject ganda setelah "what/who" ketika kata tersebut sudah menjadi Subject (mis. "what it happened").',
    strategy: 'Periksa apakah kata kerja di dalam Noun Clause sudah punya Subject. Jika belum, connector-nya sendiri adalah Subject.',
    relatedSkills: ['Skill 9', 'Skill 12'],
    questionType: 'Structure (Completion)',
    question: '_______ was on television made me angry.',
    options: [
      '(A) It',
      '(B) The story',
      '(C) What',
      '(D) When'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Menghasilkan 2 Verb ("was" dan "made") tanpa connector.',
      '(B) Salah — Menghasilkan 2 Verb tanpa connector.',
      '(C) Benar — "What" berfungsi sebagai connector sekaligus Subject untuk "was on television", membentuk Noun Clause subjek bagi "made".',
      '(D) Salah — "When" tidak bisa berfungsi sebagai Subject.'
    ]
  },
  {
    num: 11, group: 'C', page: 'p. 221', title: 'Use adjective clause connectors correctly',
    indonesianTitle: 'Gunakan Adjective Clause Connectors (whom, which, that) dengan Benar',
    objective: 'Menggunakan penghubung Adjective Clause (whom untuk orang, which untuk benda, that untuk orang/benda) sebagai objek di dalam anak kalimat.',
    explanation: 'Adjective Clause menjelaskan kata benda (Noun) yang berada tepat di depannya. Jika connector (whom, which, that) berfungsi sebagai objek dalam klausa tersebut, setelah connector harus ada Subject + Verb.',
    formula: '[Noun] + [whom / which / that] + [Subject + Verb]',
    exampleEn: 'The woman whom you met is my professor. | The glass that she put on the table contains milk.',
    exampleId: 'Wanita yang kamu temui itu adalah dosen saya.',
    tokens: [
      { text: 'The gift', role: 'Subject' },
      { text: 'which', role: 'Connector' },
      { text: 'we selected', role: 'Verb' },
      { text: 'for the bride', role: 'PrepPhrase' },
      { text: 'was rather expensive.', role: 'Verb' }
    ],
    commonMistake: 'Mengulang objek di akhir adjective clause (mis. "...which we selected it" → SALAH!).',
    strategy: 'Pastikan Adjective Clause diletakkan tepat setelah kata benda yang dijelaskannya.',
    relatedSkills: ['Skill 12', 'Skill 14'],
    questionType: 'Structure (Completion)',
    question: 'The gift _______ selected for the bride was rather expensive.',
    options: [
      '(A) because',
      '(B) was',
      '(C) since',
      '(D) which we'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — Adverb connector tidak menerangkan noun "The gift".',
      '(B) Salah — Membuat Verb ganda.',
      '(C) Salah — Adverb connector.',
      '(D) Benar — "which we" menyediakan adjective clause connector + Subject untuk Verb "selected".'
    ]
  },
  {
    num: 12, group: 'C', page: 'p. 223', title: 'Use adjective clause connector/subjects correctly',
    indonesianTitle: 'Gunakan Adjective Clause Connector/Subjects (who, which, that) dengan Benar',
    objective: 'Menggunakan kata hubung (who untuk orang, which untuk benda, that untuk keduanya) yang sekaligus menjadi Subject di dalam Adjective Clause.',
    explanation: 'Ketika kata benda yang dijelaskan melakukan tindakan dalam Adjective Clause, connector (who, which, that) langsung diikuti oleh Verb.',
    formula: '[Noun] + [who / which / that (Connector sekaligus Subject)] + [Verb]',
    exampleEn: 'The woman who is waving to us is the tour guide. | The letter which arrived today was for me.',
    exampleId: 'Wanita yang sedang melambai kepada kita itu adalah pemandu wisata.',
    tokens: [
      { text: 'The scientist', role: 'Subject' },
      { text: 'who', role: 'Connector' },
      { text: 'discovered the element', role: 'Verb' },
      { text: 'won', role: 'Verb' },
      { text: 'the Nobel Prize.', role: 'Clause' }
    ],
    commonMistake: 'Menggunakan "whom" sebagai Subject (seharusnya "who") atau memakai "which" untuk manusia.',
    strategy: 'Cek apakah kata benda di depan adalah manusia (who/that) atau benda/hewan (which/that), lalu pastikan kesesuaian jumlah Verb-nya.',
    relatedSkills: ['Skill 11', 'Skill 14', 'Skill 23'],
    questionType: 'Structure (Completion)',
    question: '_______ is on the table has four sections.',
    options: [
      '(A) The notebook',
      '(B) The notebook which',
      '(C) Because the notebook',
      '(D) In the notebook'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Menghasilkan 2 Verb ("is" dan "has") tanpa connector.',
      '(B) Benar — "The notebook" adalah Subject utama untuk "has", dan "which" adalah connector/subject untuk "is on the table".',
      '(C) Salah — Tidak membentuk subjek yang sah.',
      '(D) Salah — Prepositional phrase tidak bisa menjadi subjek.'
    ]
  },
  // Group D: Sentences with Reduced Clauses (13-14)
  {
    num: 13, group: 'D', page: 'p. 227', title: 'Use reduced adverb clauses correctly',
    indonesianTitle: 'Gunakan Reduced Adverb Clauses (Anak Kalimat Keterangan yang Diringkas)',
    objective: 'Meringkas Adverb Clause dengan menghapus Subject dan "be", lalu mengubah kata kerja aktif menjadi V-ing atau mempertahankan V3 untuk makna pasif.',
    explanation: 'Adverb Clause (dengan after, before, since, while, when, although, if, unless) dapat diringkas HANYA JIKA Subject pada anak kalimat dan induk kalimat adalah SAMA.',
    formula: 'Aktif: [Connector] + [V-ing], [S + V]  |  Pasif: [Connector] + [V3], [S + V]',
    exampleEn: 'Although he feels rather sick → Although feeling rather sick, the speaker will take part in the seminar.',
    exampleId: 'Meskipun merasa agak sakit, pembicara itu akan tetap berpartisipasi dalam seminar.',
    tokens: [
      { text: 'When', role: 'Connector' },
      { text: 'purchased at this store,', role: 'Clause' },
      { text: 'the computer', role: 'Subject' },
      { text: 'includes', role: 'Verb' },
      { text: 'a warranty.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Memilih V-ing untuk makna pasif atau memilih bentuk Subject terbalik setelah connector.',
    strategy: 'Uji apakah Subject kalimat utama melakukan aksi (V-ing) atau dikenai aksi (V3).',
    relatedSkills: ['Skill 7', 'Skill 8', 'Skill 14'],
    questionType: 'Structure (Completion)',
    question: 'When _______, you are free to leave.',
    options: [
      '(A) the finished report',
      '(B) finished with the report',
      '(C) the report',
      '(D) is the report finished'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Tidak membentuk reduced clause yang benar dengan subjek "you".',
      '(B) Benar — Bentuk ringkas dari "When [you are] finished with the report".',
      '(C) Salah — Subjek berbeda dan tidak lengkap.',
      '(D) Salah — Susunan kalimat tanya tidak tepat.'
    ]
  },
  {
    num: 14, group: 'D', page: 'p. 230', title: 'Use reduced adjective clauses correctly',
    indonesianTitle: 'Gunakan Reduced Adjective Clauses (Anak Kalimat Sifat yang Diringkas)',
    objective: 'Meringkas Adjective Clause dengan menghapus connector (who, which, that) dan "be", menghasilkan V-ing (aktif), V3 (pasif), atau frasa appositive.',
    explanation: 'Adjective Clause hanya dapat diringkas jika connector-nya (who, which, that) berfungsi sebagai Subject di dalam klausa tersebut.',
    formula: 'Aktif: [Noun] + [V-ing]  |  Pasif: [Noun] + [V3]  |  Appositive: [Noun], [Noun Phrase],',
    exampleEn: 'The woman who is waving to us → The woman waving to us is the tour guide.',
    exampleId: 'Wanita yang sedang melambai kepada kita itu adalah pemandu wisata.',
    tokens: [
      { text: 'The White House,', role: 'Subject' },
      { text: 'located in Washington,', role: 'Clause' },
      { text: 'is', role: 'Verb' },
      { text: 'the home of the president.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menghapus "who/which" tetapi membiarkan "is/was/are/were" tetap tertulis (mis. "The woman is waving to us is...").',
    strategy: 'Jika connector dihapus, "be" juga harus ikut dihapus! Sisakan V-ing (aktif) atau V3 (pasif).',
    relatedSkills: ['Skill 3', 'Skill 4', 'Skill 5', 'Skill 12'],
    questionType: 'Structure (Completion)',
    question: '_______ on several different television programs, the witness gave conflicting accounts of what had happened.',
    options: [
      '(A) He appeared',
      '(B) Who appeared',
      '(C) Appearing',
      '(D) Appears'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Menghasilkan 2 klausa tanpa connector.',
      '(B) Salah — Adjective clause tidak bisa diletakkan di depan kata benda yang dijelaskannya.',
      '(C) Benar — Reduced adjective clause aktif dari "The witness, who appeared on several different television programs..." yang dipindah ke awal kalimat.',
      '(D) Salah — Verb terkonjugasi tanpa subjek dan penghubung.'
    ]
  },
  // Group E: Sentences with Inverted Subjects and Verbs (15-19)
  {
    num: 15, group: 'E', page: 'p. 235', title: 'Invert the subject and verb with question words',
    indonesianTitle: 'Inversi Subject dan Verb pada Kalimat Tanya vs Tidak Inversi pada Noun Clause',
    objective: 'Membedakan kapan question words (who, what, when, where, why, how) memicu inversi (kalimat tanya langsung) dan kapan TIDAK memicu inversi (ketika menghubungkan dua klausa).',
    explanation: 'Pada kalimat tanya langsung, Subject dan Verb dibalik (Verb + Subject). Namun, ketika question word menjadi connector penghubung dua klausa, susunannya kembali normal (Subject + Verb).',
    formula: 'Tanya Langsung: [QW] + [V] + [S]?  |  Connector Klausa: [S + V] + [QW] + [S + V].',
    exampleEn: 'What are they doing? (Inversi)  vs.  I do not know what they are doing. (Tidak Inversi)',
    exampleId: 'Apa yang sedang mereka lakukan? vs. Saya tidak tahu apa yang sedang mereka lakukan.',
    tokens: [
      { text: 'The lawyer', role: 'Subject' },
      { text: 'asked the client', role: 'Verb' },
      { text: 'why', role: 'Connector' },
      { text: 'he', role: 'Subject' },
      { text: 'had done it.', role: 'Verb' }
    ],
    commonMistake: 'Melakukan inversi pada kalimat berita yang diakhiri tanda titik (.).',
    strategy: 'Lihat tanda baca di akhir kalimat: jika diakhiri titik (.), jangan pilih jawaban yang terbalik (auxiliary + subject) setelah question word.',
    relatedSkills: ['Skill 9', 'Skill 16'],
    questionType: 'Structure (Completion)',
    question: 'The lawyer asked the client why _______ it.',
    options: [
      '(A) did he do',
      '(B) did he',
      '(C) he did',
      '(D) did'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Terinversi padahal kalimat berita (bukan pertanyaan langsung).',
      '(B) Salah — Terinversi dan kurang kata kerja utama.',
      '(C) Benar — Susunan normal Subject ("he") + Verb ("did") setelah connector "why".',
      '(D) Salah — Tidak ada Subject.'
    ]
  },
  {
    num: 16, group: 'E', page: 'p. 237', title: 'Invert the subject and verb with place expressions',
    indonesianTitle: 'Inversi Subject dan Verb setelah Ungkapan Tempat (Place Expressions)',
    objective: 'Melakukan inversi Subject dan Verb ketika keterangan tempat (here, there, nowhere, atau Prepositional Phrase tempat) diletakkan di awal kalimat dan bersifat wajib untuk melengkapi makna kalimat.',
    explanation: 'Ketika ekspresi lokasi muncul di awal kalimat untuk melengkapi Verb (terutama intransitive verbs atau "be"), Subject dan Verb dibalik.',
    formula: '[Place Expression di Awal Kalimat] + [Verb] + [Subject]',
    exampleEn: 'In the closet are the clothes that you want. | Around the corner is Sam\'s house.',
    exampleId: 'Di dalam lemari itu terdapat pakaian yang kamu inginkan.',
    tokens: [
      { text: 'On the second level of the parking lot', role: 'PrepPhrase' },
      { text: 'are', role: 'Verb' },
      { text: 'some empty stalls.', role: 'Subject' }
    ],
    commonMistake: 'Menyesuaikan Verb dengan kata benda di dalam Prepositional Phrase tempat, bukan dengan Subject di belakang Verb.',
    strategy: 'Pastikan Verb (singular/plural) cocok dengan Subject yang berada SETELAH Verb!',
    relatedSkills: ['Skill 2', 'Skill 20'],
    questionType: 'Structure (Completion)',
    question: 'On the second level of the parking lot _______.',
    options: [
      '(A) is empty',
      '(B) are empty',
      '(C) some empty stalls are',
      '(D) are some empty stalls'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — Tidak memiliki Subject.',
      '(B) Salah — Tidak memiliki Subject.',
      '(C) Salah — Tidak diinversi setelah place expression yang melengkapi "be".',
      '(D) Benar — Terinversi dengan benar: Verb jamak "are" + Subject jamak "some empty stalls".'
    ]
  },
  {
    num: 17, group: 'E', page: 'p. 239', title: 'Invert the subject and verb with negatives',
    indonesianTitle: 'Inversi Subject dan Verb setelah Ungkapan Negatif di Awal Kalimat',
    objective: 'Melakukan inversi menggunakan auxiliary verb (do/does/did, have, be, modal) ketika kata negatif atau hampir negatif (no, not, never, neither, nor, barely, hardly, only, rarely, scarcely, seldom) berada di awal kalimat.',
    explanation: 'Jika kata negatif/hampir negatif mengawali kalimat atau klausa, pola kalimat berubah menyerupai kalimat tanya: Negative + Auxiliary + Subject + Main Verb.',
    formula: '[Negative / Almost Negative] + [Auxiliary / Be] + [Subject] + [Main Verb]',
    exampleEn: 'Never has Mr. Jones taken a vacation. | Rarely were they so happy.',
    exampleId: 'Tidak pernah sekalipun Tuan Jones mengambil liburan.',
    tokens: [
      { text: 'Only in extremely dangerous situations', role: 'Connector' },
      { text: 'will', role: 'Verb' },
      { text: 'the printing presses', role: 'Subject' },
      { text: 'be stopped.', role: 'Verb' }
    ],
    commonMistake: 'Lupa menyisipkan auxiliary "do/does/did" ketika kata kerja utamanya berupa Simple Present atau Simple Past.',
    strategy: 'Hafalkan daftar kata pemicu inversi negatif: no, not, never, neither, nor, barely, hardly, only, rarely, scarcely, seldom.',
    relatedSkills: ['Skill 7', 'Skill 9', 'Skill 15'],
    questionType: 'Structure (Completion)',
    question: 'Only in extremely dangerous situations _______ stopped.',
    options: [
      '(A) will be the printing presses',
      '(B) the printing presses will be',
      '(C) that the printing presses will be',
      '(D) will the printing presses be'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — Semua kata kerja diletakkan di depan subjek; seharusnya hanya auxiliary pertama ("will").',
      '(B) Salah — Tidak diinversi padahal diawali "Only...".',
      '(C) Salah — Menambah "that" secara keliru.',
      '(D) Benar — Auxiliary "will" + Subject "the printing presses" + "be".'
    ]
  },
  {
    num: 18, group: 'E', page: 'p. 242', title: 'Invert the subject and verb with conditionals',
    indonesianTitle: 'Inversi Subject dan Verb pada Kalimat Pengandaian Tanpa "If"',
    objective: 'Mengenali bentuk inversi kalimat pengandaian (Conditionals) ketika kata "if" dihilangkan dan kata kerja bantu (had, should, were) dipindahkan ke depan Subject.',
    explanation: 'Dalam bahasa Inggris formal/akademik, kata "if" dapat dihilangkan jika kata kerja di klausa pengandaian adalah "had", "should", atau "were". Posisi kata kerja tersebut bergeser ke awal klausa menggantikan "if".',
    formula: 'If he had taken → Had he taken  |  If you should arrive → Should you arrive  |  If I were → Were I',
    exampleEn: 'Had he taken more time, the results would have been better.',
    exampleId: 'Seandainya dia meluangkan lebih banyak waktu, hasilnya pasti sudah lebih baik.',
    tokens: [
      { text: 'Were', role: 'Verb' },
      { text: 'our neighbors', role: 'Subject' },
      { text: 'a bit quieter,', role: 'Clause' },
      { text: 'we', role: 'Subject' },
      { text: 'would not complain.', role: 'Verb' }
    ],
    commonMistake: 'Menulis "If had he taken..." (menggabungkan "if" dan inversi sekaligus).',
    strategy: 'Jika melihat klausa di awal kalimat dimulai dengan "Had", "Should", atau "Were" dan diakhiri tanda titik (bukan tanda tanya), itu adalah pengandaian tanpa "if".',
    relatedSkills: ['Skill 8', 'Skill 17'],
    questionType: 'Structure (Completion)',
    question: 'The report would have been accepted _______ in checking its accuracy.',
    options: [
      '(A) if more care',
      '(B) more care had been taken',
      '(C) had taken more care',
      '(D) had more care been taken'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — Klausa tidak memiliki Verb.',
      '(B) Salah — Tidak ada connector "if" maupun inversi.',
      '(C) Salah — Makna aktif tidak cocok untuk benda mati "care".',
      '(D) Benar — Inversi pasif tanpa "if": "had more care been taken" (= if more care had been taken).'
    ]
  },
  {
    num: 19, group: 'E', page: 'p. 244', title: 'Invert the subject and verb with comparisons',
    indonesianTitle: 'Inversi Subject dan Verb setelah Perbandingan (Comparisons)',
    objective: 'Mengenali inversi opsional yang sangat umum muncul dalam TOEFL setelah bentuk perbandingan (-er than / more...than / as...as).',
    explanation: 'Setelah kata perbandingan seperti "than" atau "as", Subject dan Verb di bagian kedua perbandingan boleh dibalik (terutama jika Subject kedua berupa frasa benda yang panjang).',
    formula: '[S + V] + [more/-er ... than / as ... as] + [Verb / Auxiliary] + [Subject]',
    exampleEn: 'My sister spends more hours in the office than do John and Sam.',
    exampleId: 'Saudara perempuanku menghabiskan lebih banyak jam di kantor daripada John dan Sam.',
    tokens: [
      { text: 'The results of the current experiment', role: 'Subject' },
      { text: 'appear to be more consistent', role: 'Verb' },
      { text: 'than', role: 'Connector' },
      { text: 'were', role: 'Verb' },
      { text: 'the results of any previous tests.', role: 'Subject' }
    ],
    commonMistake: 'Mengira bentuk "...than were the results..." salah hanya karena Verb berada di depan Subject.',
    strategy: 'Setelah "than", cek apakah kata kerja bantu (do/does/did, is/are/was/were, has/have) sesuai tenses dan jumlahnya dengan Subject pembanding.',
    relatedSkills: ['Skill 27', 'Skill 28'],
    questionType: 'Structure (Completion)',
    question: 'The results of the current experiment appear to be more consistent than _______ the results of any previous tests.',
    options: [
      '(A) them',
      '(B) were',
      '(C) they were',
      '(D) were they'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Pronoun objek tidak membentuk perbandingan klausa yang tepat.',
      '(B) Benar — Inversi perbandingan: Verb jamak "were" sebelum Subject jamak "the results".',
      '(C) Salah — Menambah subjek ganda "they" di depan "the results".',
      '(D) Salah — Menambah subjek ganda "they".'
    ]
  },
  // Group F: Subject/Verb Agreement (20-23)
  {
    num: 20, group: 'F', page: 'p. 248', title: 'Make verbs agree after prepositional phrases',
    indonesianTitle: 'Sesuaikan Verb dengan Subject Asli setelah Prepositional Phrases',
    objective: 'Memastikan Verb (tunggal vs jamak) cocok dengan Subject utama, bukan dengan kata benda yang terjebak di dalam Prepositional Phrase di antara Subject dan Verb.',
    explanation: 'Soal Written Expression sangat sering menyisipkan Prepositional Phrase panjang (mis. "of the rooms", "in the buildings") di antara Subject tunggal dan Verb untuk mengecoh peserta.',
    formula: '[Singular Subject] + (of Plural Nouns) + [Singular Verb]  |  [Plural Subject] + (of Singular Noun) + [Plural Verb]',
    exampleEn: 'The key to the doors is in the drawer. ("The key" tunggal → "is", bukan "are"!)',
    exampleId: 'Kunci untuk pintu-pintu itu ada di dalam laci.',
    tokens: [
      { text: 'The climbers', role: 'Subject' },
      { text: 'on the sheer face of the mountain', role: 'PrepPhrase' },
      { text: 'need', role: 'Verb' },
      { text: 'to be rescued.', role: 'Clause' }
    ],
    commonMistake: 'Menyesuaikan Verb dengan kata benda terakhir tepat sebelum Verb (mis. "doors are").',
    strategy: 'Coret frasa preposisi yang dimulai dengan "of, in, on, at, with, from" di antara Subject dan Verb.',
    relatedSkills: ['Skill 1', 'Skill 2'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The climbers (A) on the sheer face (B) of the mountain (C) needs (D) to be rescued.',
    options: [
      '(A) climbers',
      '(B) sheer face',
      '(C) mountain',
      '(D) needs'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Benar — Subject jamak "The climbers" sudah tepat.',
      '(B) Benar — Bagian dari prepositional phrase.',
      '(C) Benar — Objek dari preposisi "of".',
      '(D) Salah (Harus diperbaiki) — Subject utama adalah "climbers" (jamak), sehingga Verb harus "need", bukan "needs".'
    ]
  },
  {
    num: 21, group: 'F', page: 'p. 250', title: 'Make verbs agree after expressions of quantity',
    indonesianTitle: 'Sesuaikan Verb setelah Ungkapan Kuantitas (all, most, some, half of...)',
    objective: 'Menentukan jumlah Verb (tunggal atau jamak) berdasarkan objek setelah preposisi "of" ketika Subject diawali kata kuantitas (all, most, some, half, part).',
    explanation: 'Khusus untuk ungkapan kuantitas (all, most, some, half), Verb tidak ditentukan oleh kata kuantitasnya, melainkan oleh kata benda setelah "of".',
    formula: '[All / Most / Some / Half] + of + [Singular/Uncountable Noun] + [Singular Verb]  |  + [Plural Noun] + [Plural Verb]',
    exampleEn: 'All of the book was interesting. | All of the books were interesting. | All of the information was interesting.',
    exampleId: 'Seluruh buku itu menarik vs. Semua buku itu menarik.',
    tokens: [
      { text: 'Half of the students', role: 'Subject' },
      { text: 'in the class', role: 'PrepPhrase' },
      { text: 'arrive', role: 'Verb' },
      { text: 'early.', role: 'Clause' }
    ],
    commonMistake: 'Mengira "all" atau "most" selalu jamak meskipun diikuti uncountable noun seperti "money" atau "water".',
    strategy: 'Lihat kata benda tepat di belakang kata "of": jika jamak → Verb jamak; jika tunggal/uncountable → Verb tunggal.',
    relatedSkills: ['Skill 20', 'Skill 40'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'Some of the (A) animals from the zoo (B) was (C) released into the animal preserve (D).',
    options: [
      '(A) animals',
      '(B) from the zoo',
      '(C) was',
      '(D) preserve'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Kata benda jamak setelah "Some of the".',
      '(B) Benar — Prepositional phrase penjelas.',
      '(C) Salah (Harus diperbaiki) — Karena "animals" jamak, Verb harus jamak ("were"), bukan "was".',
      '(D) Benar — Kata benda cagar alam.'
    ]
  },
  {
    num: 22, group: 'F', page: 'p. 251', title: 'Make inverted verbs agree',
    indonesianTitle: 'Sesuaikan Verb pada Kalimat Inversi dengan Subject di Belakangnya',
    objective: 'Memastikan kesesuaian Subject dan Verb pada kalimat inversi (setelah place expressions, negatives, question words, conditionals, comparisons).',
    explanation: 'Pada kalimat inversi, Subject berada SETELAH Verb. Peserta tes sering terkecoh karena melihat kata benda tunggal di awal kalimat padahal Subject sebenarnya di belakang adalah jamak.',
    formula: '[Pemicu Inversi] + [Singular Verb] + [Singular Subject]  |  [Plural Verb] + [Plural Subject]',
    exampleEn: 'Behind the house were the bicycles I wanted. ("bicycles" jamak → "were", bukan "was"!).',
    exampleId: 'Di belakang rumah itu terdapat sepeda-sepeda yang saya inginkan.',
    tokens: [
      { text: 'Rarely', role: 'Connector' },
      { text: 'are', role: 'Verb' },
      { text: 'good opportunities', role: 'Subject' },
      { text: 'wasted.', role: 'Clause' }
    ],
    commonMistake: 'Menyesuaikan Verb dengan kata benda tempat di awal kalimat (mis. "Behind the house was the bicycles").',
    strategy: 'Cari Subject sejati yang terletak di sebelah kanan Verb pada kalimat inversi.',
    relatedSkills: ['Skill 16', 'Skill 17', 'Skill 20'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'Around the corner and (A) to the right (B) is (C) the rooms (D) that have been assigned to that program.',
    options: [
      '(A) and',
      '(B) to the right',
      '(C) is',
      '(D) the rooms'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Penghubung dua keterangan tempat.',
      '(B) Benar — Keterangan tempat.',
      '(C) Salah (Harus diperbaiki) — Subject di belakang adalah "the rooms" (jamak), maka Verb harus "are".',
      '(D) Benar — Subject jamak.'
    ]
  },
  {
    num: 23, group: 'F', page: 'p. 253', title: 'Make verbs agree after certain words',
    indonesianTitle: 'Gunakan Verb Tunggal setelah Kata-Kata Tertentu (anybody, everybody, each, every)',
    objective: 'Menggunakan Verb tunggal untuk kata ganti tak tentu (anybody, anyone, anything, everybody, everyone, everything, nobody, no one, nothing, somebody, someone, something) serta "each" dan "every".',
    explanation: 'Meskipun kata seperti "everybody" atau "everyone" bermakna banyak orang secara logika, secara tata bahasa bahasa Inggris kata-kata tersebut SELALU dianggap TUNGGAL (Singular).',
    formula: '[Everybody / Everyone / Each + Noun / Every + Noun] + [Singular Verb]',
    exampleEn: 'Everybody are going to the theater → (SALAH) | Everybody is going to the theater → (BENAR)',
    exampleId: 'Semua orang sedang pergi ke bioskop.',
    tokens: [
      { text: 'Each of the doctors', role: 'Subject' },
      { text: 'in the building', role: 'PrepPhrase' },
      { text: 'needs', role: 'Verb' },
      { text: 'to have a separate reception area.', role: 'Clause' }
    ],
    commonMistake: 'Menggunakan Verb jamak setelah "everybody/everyone" atau "each of the + plural noun".',
    strategy: 'Hafalkan: setiap kata berakhiran -body, -one, -thing, serta "each" dan "every" wajib memakai Verb tunggal.',
    relatedSkills: ['Skill 20', 'Skill 45'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'It is impossible (A) to believe that somebody (B) actually admire (C) that man (D).',
    options: [
      '(A) impossible',
      '(B) somebody',
      '(C) admire',
      '(D) that man'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Adjective setelah "It is".',
      '(B) Benar — Indefinite pronoun tunggal.',
      '(C) Salah (Harus diperbaiki) — "somebody" tunggal, sehingga Verb harus "admires".',
      '(D) Benar — Objek.'
    ]
  },
  // Group G: Parallel Structure (24-26)
  {
    num: 24, group: 'G', page: 'p. 256', title: 'Use parallel structure with coordinate conjunctions',
    indonesianTitle: 'Gunakan Struktur Paralel dengan Coordinate Conjunctions (and, but, or)',
    objective: 'Menyetarakan kelas kata atau struktur frasa (Noun dengan Noun, Verb dengan Verb, V-ing dengan V-ing, Adjective dengan Adjective) yang dihubungkan oleh and, but, atau or.',
    explanation: 'Kata hubung "and", "but", dan "or" berfungsi seperti tanda sama dengan (=); struktur di sebelah kiri dan kanan harus setara secara gramatikal.',
    formula: '[Struktur A] + [and / but / or] + [Struktur A (Setara)]',
    exampleEn: 'He discussed the problem with the nurse and the doctor. (Noun + and + Noun)',
    exampleId: 'Dia mendiskusikan masalah itu dengan perawat dan dokter.',
    tokens: [
      { text: 'She', role: 'Subject' },
      { text: 'hikes, jogs,', role: 'Verb' },
      { text: 'or', role: 'Connector' },
      { text: 'rides her bicycle', role: 'Verb' },
      { text: 'whenever she can.', role: 'Clause' }
    ],
    commonMistake: 'Mencampur bentuk kata dalam satu deretan, misalnya "swimming, hiking, and to ride a bike".',
    strategy: 'Lingkari kata "and/but/or" pada soal, lalu bandingkan bentuk kata di kiri dan kanannya.',
    relatedSkills: ['Skill 25', 'Skill 26'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The pastries in that shop (A) are very expensive (B) but quite deliciously (C) made? No: quite deliciously (C) for the price (D).',
    options: [
      '(A) in that shop',
      '(B) expensive',
      '(C) deliciously',
      '(D) for the price'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Prepositional phrase.',
      '(B) Benar — Adjective setelah "are".',
      '(C) Salah (Harus diperbaiki) — Harus sejajar dengan adjective "expensive", sehingga harus adjective "delicious", bukan adverb "deliciously".',
      '(D) Benar — Prepositional phrase.'
    ]
  },
  {
    num: 25, group: 'G', page: 'p. 258', title: 'Use parallel structure with paired conjunctions',
    indonesianTitle: 'Gunakan Struktur Paralel dengan Paired Conjunctions (both...and, either...or, neither...nor, not only...but also)',
    objective: 'Memastikan pasangan konjungsi berpasangan tepat AND struktur setelah masing-masing bagian setara.',
    explanation: 'Ada dua hal yang diuji: (1) Pasangannya tidak boleh tertukar (both + and; either + or; neither + nor; not only + but also), dan (2) Struktur gramatikal setelah kedua kata hubung harus sama.',
    formula: 'both [X] and [X]  |  either [X] or [X]  |  neither [X] nor [X]  |  not only [X] but also [X]',
    exampleEn: 'He wants either to go by train or to go by plane. (to-V1 setelah "either" & to-V1 setelah "or")',
    exampleId: 'Dia ingin pergi dengan kereta api atau pergi dengan pesawat.',
    tokens: [
      { text: 'They', role: 'Subject' },
      { text: 'want', role: 'Verb' },
      { text: 'neither', role: 'Connector' },
      { text: 'the money', role: 'Clause' },
      { text: 'nor the fame.', role: 'Clause' }
    ],
    commonMistake: 'Memasangkan "neither" dengan "or", "both" dengan "as well as", atau meletakkan kata kerja sebelum "not only" tetapi mengulangnya setelah "but also".',
    strategy: 'Periksa dulu pasangannya (both/and, either/or, neither/nor, not only/but also), lalu cek kesejajaran strukturnya.',
    relatedSkills: ['Skill 24', 'Skill 26'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'Their marriage (A) will take place (B) either in June (C) nor (D) in July.',
    options: [
      '(A) marriage',
      '(B) take place',
      '(C) in June',
      '(D) nor'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Benar — Subject.',
      '(B) Benar — Verb.',
      '(C) Benar — Prepositional phrase.',
      '(D) Salah (Harus diperbaiki) — Pasangan dari "either" adalah "or", bukan "nor".'
    ]
  },
  {
    num: 26, group: 'G', page: 'p. 259', title: 'Use parallel structure with comparisons',
    indonesianTitle: 'Gunakan Struktur Paralel pada Kalimat Perbandingan',
    objective: 'Menyetarakan dua hal yang dibandingkan menggunakan more...than, -er...than, less...than, as...as, the same...as, atau similar...to.',
    explanation: 'Dalam perbandingan, dua unsur yang dibandingkan harus memiliki bentuk gramatikal yang setara (misalnya gerund dibandingkan dengan gerund, noun dengan noun, prepositional phrase dengan prepositional phrase).',
    formula: '[Struktur A] + [more/-er ... than / as ... as / similar to] + [Struktur A (Setara)]',
    exampleEn: 'To be rich is better than to be poor. | What is written is more easily understood than what is spoken.',
    exampleId: 'Menjadi kaya lebih baik daripada menjadi miskin.',
    tokens: [
      { text: 'Dining in a restaurant', role: 'Subject' },
      { text: 'is', role: 'Verb' },
      { text: 'more fun than', role: 'Connector' },
      { text: 'eating at home.', role: 'Clause' }
    ],
    commonMistake: 'Membandingkan benda dengan orang (mis. "His research is better than John" → seharusnya "than John\'s" atau "than that of John").',
    strategy: 'Identifikasi dua hal yang dibandingkan dan pastikan keduanya setara secara kategori dan bentuk kata.',
    relatedSkills: ['Skill 24', 'Skill 27'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The work that I did (A) is similar (B) to the work that (C) you done (D).',
    options: [
      '(A) did',
      '(B) similar',
      '(C) that',
      '(D) you done'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Benar — Simple Past Verb.',
      '(B) Benar — Adjective perbandingan diikuti "to".',
      '(C) Benar — Relative pronoun.',
      '(D) Salah (Harus diperbaiki) — Harus sejajar dengan "I did" (Simple Past), sehingga harus "you did", bukan "you done".'
    ]
  },
  // Group H: Comparatives and Superlatives (27-29)
  {
    num: 27, group: 'H', page: 'p. 262', title: 'Form comparatives and superlatives correctly',
    indonesianTitle: 'Bentuk Comparative (-er / more) dan Superlative (-est / most) dengan Tepat',
    objective: 'Menggunakan akhiran -er/-est untuk kata sifat pendek (1 suku kata & 2 suku kata berakhiran -y) dan more/most untuk kata sifat panjang (2+ suku kata), tanpa menggandakan keduanya.',
    explanation: 'Jangan pernah menggabungkan "more" dengan "-er" (mis. "more taller") atau "most" dengan "-est" (mis. "most fastest").',
    formula: '1 suku kata: tall → taller / the tallest  |  2+ suku kata: modern → more modern / the most modern',
    exampleEn: 'Bob is taller than Ron. | Sally is the most beautiful of all the women at the party.',
    exampleId: 'Bob lebih tinggi daripada Ron. | Sally adalah yang paling cantik di antara semua wanita di pesta.',
    tokens: [
      { text: 'The speed of light', role: 'Subject' },
      { text: 'is', role: 'Verb' },
      { text: 'much faster than', role: 'Connector' },
      { text: 'the speed of sound.', role: 'Clause' }
    ],
    commonMistake: 'Menggunakan bentuk ganda seperti "more easier" atau "the most cleanest".',
    strategy: 'Hitung suku kata adjective/adverb dan pastikan tidak ada penggunaan ganda (more + -er atau most + -est).',
    relatedSkills: ['Skill 28', 'Skill 29'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The lesson (A) you are studying (B) now is the most easiest (C) lesson that we will have (D).',
    options: [
      '(A) The lesson',
      '(B) are studying',
      '(C) most easiest',
      '(D) will have'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Noun.',
      '(B) Benar — Present continuous.',
      '(C) Salah (Harus diperbaiki) — Bentuk ganda "most easiest"; seharusnya cukup "easiest".',
      '(D) Benar — Future verb.'
    ]
  },
  {
    num: 28, group: 'H', page: 'p. 264', title: 'Use comparatives and superlatives correctly',
    indonesianTitle: 'Gunakan Comparative (untuk 2 Hal) vs Superlative (untuk 3+ Hal) dengan Tepat',
    objective: 'Membedakan fungsi Comparative (membandingkan tepat dua hal) dan Superlative (memilih satu yang paling menonjol di antara tiga hal atau lebih).',
    explanation: 'Jika hanya ada dua hal yang dibandingkan, wajib gunakan Comparative (-er / more). Jika ada tiga hal atau lebih (sering ditandai "in the world", "of all", "among the three"), gunakan Superlative (the -est / the most).',
    formula: '2 Hal → Comparative (-er / more ... than)  |  3+ Hal → Superlative (the -est / the most ... in/of)',
    exampleEn: 'The history class is larger than the math class. (2 kelas) | The history class is the largest in the school. (semua kelas)',
    exampleId: 'Kelas sejarah lebih besar daripada kelas matematika vs. Kelas sejarah adalah yang terbesar di sekolah.',
    tokens: [
      { text: 'Harvard University', role: 'Subject' },
      { text: 'is', role: 'Verb' },
      { text: 'the oldest', role: 'Clause' },
      { text: 'institution of higher learning', role: 'PrepPhrase' },
      { text: 'in the United States.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Memakai superlative saat membandingkan 2 orang/benda (mis. "Of the two brothers, John is the tallest" → salah; harusnya "the taller").',
    strategy: 'Hitung jumlah objek yang dibandingkan: 2 objek = Comparative; 3+ objek = Superlative.',
    relatedSkills: ['Skill 27', 'Skill 29'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'Between the two (A) candidates, Sarah is definitely (B) the most qualified (C) for the position (D).',
    options: [
      '(A) Between the two',
      '(B) definitely',
      '(C) the most qualified',
      '(D) for the position'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Menunjukkan tepat 2 kandidat.',
      '(B) Benar — Adverb.',
      '(C) Salah (Harus diperbaiki) — Karena hanya membandingkan 2 kandidat ("two candidates"), harus menggunakan comparative "the more qualified".',
      '(D) Benar — Prepositional phrase.'
    ]
  },
  {
    num: 29, group: 'H', page: 'p. 266', title: 'Use the irregular -er, -er structure correctly',
    indonesianTitle: 'Gunakan Pola Perbandingan Berbanding Lurus (The -er, the -er)',
    objective: 'Menggunakan pola "The + comparative ..., the + comparative ..." untuk menyatakan hubungan sebab-akibat berbanding lurus ("Semakin..., semakin...").',
    explanation: 'Pola khusus "The more / The -er ..., the more / the -er ..." wajib diawali kata sandang "the" di kedua bagian klausa.',
    formula: 'The + [Comparative] + [S + V], + the + [Comparative] + [S + V]',
    exampleEn: 'The harder he tried, the further he fell behind. | The greater the experience, the higher the salary.',
    exampleId: 'Semakin keras dia mencoba, semakin jauh dia tertinggal.',
    tokens: [
      { text: 'The warmer', role: 'Connector' },
      { text: 'the weather,', role: 'Subject' },
      { text: 'the greater', role: 'Connector' },
      { text: 'the attendance', role: 'Subject' },
      { text: 'at the outdoor concert.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menghilangkan kata "the" di bagian kedua kalimat atau memakai bentuk superlative (-est) alih-alih comparative (-er).',
    strategy: 'Pastikan kedua sisi koma memiliki pola "the + comparative" yang sejajar.',
    relatedSkills: ['Skill 26', 'Skill 27'],
    questionType: 'Structure (Completion)',
    question: 'The thicker the walls, _______ the noise that comes through.',
    options: [
      '(A) less',
      '(B) little',
      '(C) the less',
      '(D) the least'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Kehilangan kata "the" di depan comparative.',
      '(B) Salah — Bentuk dasar, bukan comparative.',
      '(C) Benar — Melengkapi pola "The + comparative ..., the + comparative (the less)".',
      '(D) Salah — Bentuk superlative, bukan comparative.'
    ]
  },
  // Group I: Form of the Verb (30-32)
  {
    num: 30, group: 'I', page: 'p. 269', title: 'After have, use the past participle',
    indonesianTitle: 'Setelah "have / has / had", Gunakan Past Participle (V3)',
    objective: 'Memastikan setiap bentuk kata kerja bantu "have" (have, has, had, having) selalu diikuti oleh Past Participle (V3), bukan V1 maupun V2.',
    explanation: 'Dalam tenses Perfect (Present Perfect, Past Perfect, Future Perfect, Modal + have), kata kerja setelah "have/has/had" wajib berbentuk V3 (Lihat Appendix F untuk Irregular Verbs).',
    formula: '[have / has / had / having] + [Past Participle (V3)]',
    exampleEn: 'They had walk to school → (SALAH) | They had walked to school → (BENAR)',
    exampleId: 'Mereka telah berjalan kaki ke sekolah.',
    tokens: [
      { text: 'She', role: 'Subject' },
      { text: 'has', role: 'Verb' },
      { text: 'taken', role: 'Verb' },
      { text: 'the test', role: 'Clause' },
      { text: 'several times.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menggunakan bentuk Simple Past (V2) setelah "have/has/had" pada irregular verbs, seperti "has took", "had went", "have wrote".',
    strategy: 'Setiap kali melihat "have, has, had" digarisbawahi atau berada di depan garis bawah, segera cek apakah kata kerja berikutnya adalah V3!',
    relatedSkills: ['Skill 31', 'Skill 32'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The young girl (A) drunk (B) a glass of milk (C) after she had ran (D) two miles.',
    options: [
      '(A) young girl',
      '(B) drunk',
      '(C) of milk',
      '(D) had ran'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Benar — Subject.',
      '(B) Catatan: Fokus utama soal Longman pada "had ran" — setelah "had" harus V3 "run", bukan V2 "ran".',
      '(C) Benar — Prepositional phrase.',
      '(D) Salah (Harus diperbaiki) — Setelah "had" wajib menggunakan V3 "run" (run - ran - run).'
    ]
  },
  {
    num: 31, group: 'I', page: 'p. 270', title: 'After be, use the present participle or the past participle',
    indonesianTitle: 'Setelah "be", Gunakan Present Participle (V-ing) atau Past Participle (V3)',
    objective: 'Memastikan kata kerja setelah "be" (am, is, are, was, were, be, been, being) hanya berbentuk V-ing (kalimat aktif continuous) atau V3 (kalimat pasif), tidak pernah V1 atau V2.',
    explanation: 'Kata kerja "be" tidak pernah diikuti oleh bentuk dasar (V1) maupun Simple Past (V2).',
    formula: '[be] + [V-ing (Aktif)]   ATAU   [be] + [V3 (Pasif)]',
    exampleEn: 'We are do our homework → (SALAH: "are doing") | The homework was do early → (SALAH: "was done")',
    exampleId: 'Kami sedang mengerjakan PR kami. | PR itu telah dikerjakan lebih awal.',
    tokens: [
      { text: 'The film', role: 'Subject' },
      { text: 'is', role: 'Verb' },
      { text: 'being shown', role: 'Verb' },
      { text: 'at the campus theater.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menggunakan V1 atau V2 setelah "was/were/is/are" (mis. "was took", "is finish").',
    strategy: 'Jika melihat bentuk "be" diikuti kata kerja, pastikan kata kerjanya berakhiran -ing (aktif) atau V3 (pasif).',
    relatedSkills: ['Skill 30', 'Skill 37'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'At 12:00 Sam (A) is eat (B) his lunch (C) in the cafeteria (D).',
    options: [
      '(A) Sam',
      '(B) is eat',
      '(C) his lunch',
      '(D) in the cafeteria'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Benar — Subject.',
      '(B) Salah (Harus diperbaiki) — Setelah "is" harus V-ing "eating" (aktif).',
      '(C) Benar — Objek.',
      '(D) Benar — Keterangan tempat.'
    ]
  },
  {
    num: 32, group: 'I', page: 'p. 272', title: 'After will, would, or other modals, use the base form of the verb',
    indonesianTitle: 'Setelah Modal (will, would, can, could, may, might, must, shall, should), Gunakan V1 (Base Form)',
    objective: 'Memastikan kata kerja yang langsung mengikuti modal auxiliary selalu dalam bentuk dasar tanpa akhiran -s, -ed, -ing, maupun "to".',
    explanation: 'Modal verbs tidak pernah berubah bentuk dan kata kerja utama tepat di belakangnya selalu kembali ke bentuk dasar murni (bare infinitive / V1).',
    formula: '[will / would / can / could / may / might / must / should] + [Base Form Verb (V1)]',
    exampleEn: 'The boat will leaving at 3:00 → (SALAH: "will leave") | The doctor may arrives soon → (SALAH: "may arrive")',
    exampleId: 'Perahu itu akan berangkat pukul 3.00. | Dokter mungkin segera tiba.',
    tokens: [
      { text: 'The students', role: 'Subject' },
      { text: 'must', role: 'Verb' },
      { text: 'submit', role: 'Verb' },
      { text: 'their applications', role: 'Clause' },
      { text: 'before Friday.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menambahkan "-s" setelah modal ketika subjeknya tunggal (mis. "He must goes") atau menyisipkan "to" ("can to go").',
    strategy: 'Setiap melihat modal auxiliary, pastikan kata kerja berikutnya adalah V1 murni.',
    relatedSkills: ['Skill 30', 'Skill 31'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The salesclerk (A) might lower (B) the price if the customer (C) would pays (D) in cash.',
    options: [
      '(A) salesclerk',
      '(B) lower',
      '(C) customer',
      '(D) would pays'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Benar — Subject.',
      '(B) Benar — V1 setelah modal "might".',
      '(C) Benar — Subject anak kalimat.',
      '(D) Salah (Harus diperbaiki) — Setelah modal "would" harus V1 murni "pay", tanpa "-s".'
    ]
  },
  // Group J: Use of the Verb (33-36)
  {
    num: 33, group: 'J', page: 'p. 274', title: 'Know when to use the past with the present',
    indonesianTitle: 'Pahami Kapan Menggunakan Past Tense Bersama Present Tense',
    objective: 'Memastikan konsistensi logis antara Past Tense dan Present Tense dalam satu kalimat sesuai makna waktunya.',
    explanation: 'Secara umum, jika sebuah kalimat menceritakan peristiwa di masa lampau, seluruh kata kerjanya menggunakan Past Tense, KECUALI jika bagian lain kalimat menyatakan kebenaran umum (general truth) atau kondisi yang masih berlaku hingga saat ini.',
    formula: 'Peristiwa Lampau → Past Tense  |  Fakta Umum / Kondisi Kini → Present Tense',
    exampleEn: 'He took the money when he wants it → (SALAH: harusnya "wanted") | I know that he took the money yesterday → (BENAR: tahu sekarang tentang kejadian kemarin)',
    exampleId: 'Saya tahu sekarang bahwa dia mengambil uang itu kemarin.',
    tokens: [
      { text: 'Copernicus', role: 'Subject' },
      { text: 'proved', role: 'Verb' },
      { text: 'that', role: 'Connector' },
      { text: 'the Earth', role: 'Subject' },
      { text: 'revolves around the Sun.', role: 'Verb' }
    ],
    commonMistake: 'Mencampur Past dan Present tanpa alasan waktu yang logis.',
    strategy: 'Periksa petunjuk waktu (yesterday, in 1990, now, every day) untuk menentukan apakah pergantian tense masuk akal.',
    relatedSkills: ['Skill 34', 'Skill 35', 'Skill 36'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'Steve wakes up (A) early every morning (B) because he went (C) to work early (D).',
    options: [
      '(A) wakes up',
      '(B) every morning',
      '(C) went',
      '(D) early'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Kebiasaan rutin saat ini ("every morning").',
      '(B) Benar — Penanda rutinitas sekarang.',
      '(C) Salah (Harus diperbaiki) — Harus konsisten dengan kebiasaan rutin sekarang, yaitu "goes", bukan "went".',
      '(D) Benar — Adverb.'
    ]
  },
  {
    num: 34, group: 'J', page: 'p. 276', title: 'Use have and had correctly',
    indonesianTitle: 'Bedakan Penggunaan Present Perfect (have/has + V3) vs Past Perfect (had + V3)',
    objective: 'Memilih Present Perfect untuk tindakan yang dimulai di masa lalu dan masih berlanjut/relevan sekarang, dan Past Perfect untuk tindakan yang selesai sebelum titik waktu/peristiwa lain di masa lampau.',
    explanation: 'Present Perfect (have/has + V3) menghubungkan masa lalu dengan masa SEKARANG (sering memakai "since", "for", "lately"). Past Perfect (had + V3) membandingkan dua peristiwa di masa LAMPAU (peristiwa yang terjadi lebih dulu memakai "had + V3", yang belakangan memakai Simple Past).',
    formula: 'Masa Lalu → Sekarang: [have/has + V3]  |  Lampau 1 (Lebih Awal) → Lampau 2: [had + V3] ... [V2]',
    exampleEn: 'Sue has lived in Los Angeles for ten years. (masih tinggal di sana sekarang) | Sue had lived in LA for ten years before she moved to San Diego.',
    exampleId: 'Sue telah tinggal di Los Angeles selama sepuluh tahun sebelum dia pindah ke San Diego.',
    tokens: [
      { text: 'By the time', role: 'Connector' },
      { text: 'the ambulance arrived,', role: 'Verb' },
      { text: 'the victim', role: 'Subject' },
      { text: 'had already lost', role: 'Verb' },
      { text: 'consciousness.', role: 'Clause' }
    ],
    commonMistake: 'Menggunakan Past Perfect ("had + V3") sendirian tanpa ada titik referensi waktu lampau kedua, atau memakai Simple Past bersama kata "since".',
    strategy: 'Cari pasangan waktu: jika dipasangkan dengan Present → pakai have/has + V3; jika dipasangkan dengan Past → pakai had + V3.',
    relatedSkills: ['Skill 33', 'Skill 35'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'Before she retired (A) last month, Professor Wilson has taught (B) at this university (C) for thirty-five years (D).',
    options: [
      '(A) retired',
      '(B) has taught',
      '(C) at this university',
      '(D) for thirty-five years'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Benar — Titik waktu lampau ("last month").',
      '(B) Salah (Harus diperbaiki) — Karena masa mengajarnya selesai sebelum dia pensiun bulan lalu, wajib memakai Past Perfect "had taught".',
      '(C) Benar — Prepositional phrase.',
      '(D) Benar — Durasi waktu.'
    ]
  },
  {
    num: 35, group: 'J', page: 'p. 278', title: 'Use the correct tense with time expressions',
    indonesianTitle: 'Gunakan Tense yang Tepat Sesuai Penanda Waktu (Time Expressions)',
    objective: 'Mencocokkan kata keterangan waktu spesifik dengan tense wajibnya (mis. "in 1990 / ago / last year" → Simple Past; "since / lately" → Present Perfect; "by 1990" → Past Perfect).',
    explanation: 'Penanda waktu tertentu mengunci pilihan tense. Kata seperti "ago", "last...", dan tahun lampau ("in 1920") TIDAK BOLEH memakai "have/has + V3".',
    formula: 'ago / last / in [tahun lampau] → Simple Past (V2)  |  since / lately → Present Perfect (have/has + V3)',
    exampleEn: 'We moved to New York in 1980. (bukan "have moved") | We have lived in San Francisco since 1982.',
    exampleId: 'Kami pindah ke New York pada tahun 1980. | Kami telah tinggal di San Francisco sejak 1982.',
    tokens: [
      { text: 'The company', role: 'Subject' },
      { text: 'has expanded', role: 'Verb' },
      { text: 'its operations', role: 'Clause' },
      { text: 'since 1995.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menggunakan Present Perfect dengan kata "ago" atau tahun spesifik di masa lalu (mis. "has graduated in 1998").',
    strategy: 'Garis bawahi penanda waktu di kalimat terlebih dahulu sebelum memeriksa bentuk kata kerjanya.',
    relatedSkills: ['Skill 33', 'Skill 34'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The phone rang (A) several times (B) since (C) I arrived home (D).',
    options: [
      '(A) rang',
      '(B) several times',
      '(C) since',
      '(D) arrived'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Salah (Harus diperbaiki) — Kata hubung "since" menandakan tindakan berulang dari masa lalu hingga kini, sehingga harus memakai Present Perfect "has rung".',
      '(B) Benar — Keterangan frekuensi.',
      '(C) Benar — Penanda waktu sejak titik lampau.',
      '(D) Benar — Klausa setelah "since" menggunakan Simple Past.'
    ]
  },
  {
    num: 36, group: 'J', page: 'p. 279', title: 'Use the correct tense with will and would',
    indonesianTitle: 'Gunakan Tense yang Tepat Bersama "will" dan "would"',
    objective: 'Memasangkan "will" dengan konteks Present/Future dan "would" dengan konteks Past.',
    explanation: 'Aturan dasar: Present + will (future dari masa kini) dan Past + would (future dari masa lampau).',
    formula: 'Present Tense + will + V1  |  Past Tense + would + V1',
    exampleEn: 'I know that he will arrive soon. | It was certain that he would arrive soon.',
    exampleId: 'Saya tahu bahwa dia akan segera tiba. | Sudah pasti bahwa dia akan segera tiba saat itu.',
    tokens: [
      { text: 'The weather forecast', role: 'Subject' },
      { text: 'predicted', role: 'Verb' },
      { text: 'that', role: 'Connector' },
      { text: 'temperatures', role: 'Subject' },
      { text: 'would drop overnight.', role: 'Verb' }
    ],
    commonMistake: 'Memakai "will" setelah kata kerja pelaporan lampau seperti "said, thought, knew, announced".',
    strategy: 'Cek kata kerja utama kalimat: jika lampau (said/knew), gunakan "would"; jika kini (says/knows), gunakan "will".',
    relatedSkills: ['Skill 32', 'Skill 33'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'He knew (A) that he will be able (B) to pass the exam (C) if he studied hard (D).',
    options: [
      '(A) knew',
      '(B) will be able',
      '(C) to pass',
      '(D) studied'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Benar — Simple Past.',
      '(B) Salah (Harus diperbaiki) — Karena kata kerja utama lampau ("knew" dan "studied"), wajib memakai "would be able", bukan "will be able".',
      '(C) Benar — Infinitive.',
      '(D) Benar — Simple Past.'
    ]
  },
  // Group K: Passive Verbs (37-38)
  {
    num: 37, group: 'K', page: 'p. 282', title: 'Use the correct form of the passive',
    indonesianTitle: 'Bentuk Kalimat Pasif dengan Tepat (be + Past Participle V3)',
    objective: 'Memastikan setiap kalimat pasif memiliki unsur wajib "be" (dalam tense yang sesuai) diikuti Past Participle (V3) (Lihat Appendix G).',
    explanation: 'Kesalahan paling sering di TOEFL adalah menghilangkan "be" pada kalimat pasif atau menggunakan V1/V2 alih-alih V3 setelah "be".',
    formula: '[Subject] + [be (am/is/are/was/were/been/being)] + [Past Participle (V3)] + (by Agent)',
    exampleEn: 'The portrait was painting by a famous artist → (SALAH) | The portrait was painted by a famous artist → (BENAR)',
    exampleId: 'Potret itu dilukis oleh seorang seniman terkenal.',
    tokens: [
      { text: 'The bridge', role: 'Subject' },
      { text: 'was built', role: 'Verb' },
      { text: 'by local engineers', role: 'PrepPhrase' },
      { text: 'in 1925.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menulis "was paint" atau "was painting" padahal subjeknya benda mati yang dikenai tindakan.',
    strategy: 'Setiap melihat kata "by + pelaku", segera periksa apakah kata kerjanya sudah berpola "be + V3".',
    relatedSkills: ['Skill 31', 'Skill 38'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The results of the survey (A) were publish (B) in a national (C) scientific journal (D).',
    options: [
      '(A) results',
      '(B) were publish',
      '(C) national',
      '(D) journal'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Benar — Subject jamak.',
      '(B) Salah (Harus diperbaiki) — Bentuk pasif membutuhkan V3 setelah "were", yaitu "were published".',
      '(C) Benar — Adjective.',
      '(D) Benar — Noun.'
    ]
  },
  {
    num: 38, group: 'K', page: 'p. 284', title: 'Recognize active and passive meanings',
    indonesianTitle: 'Bedakan Makna Kalimat Aktif dan Pasif',
    objective: 'Menentukan apakah Subject kalimat melakukan tindakan (Aktif) atau menerima tindakan (Pasif), meskipun tidak ada kata "by" di dalam kalimat.',
    explanation: 'Tidak semua kalimat pasif memiliki frasa "by + agent". Anda harus menilai hubungan logis antara Subject dan Verb (mis. "The letter mailed yesterday" salah karena surat tidak bisa mengeposkan dirinya sendiri; harus "was mailed").',
    formula: 'Subject Melakukan Aksi → Aktif  |  Subject Dikenai Aksi → Pasif (be + V3)',
    exampleEn: 'We mailed the package at the post office. (Aktif) | The package was mailed at the post office. (Pasif)',
    exampleId: 'Paket itu dikirimkan di kantor pos.',
    tokens: [
      { text: 'All the tickets', role: 'Subject' },
      { text: 'had been sold', role: 'Verb' },
      { text: 'two hours', role: 'PrepPhrase' },
      { text: 'before the concert began.', role: 'Clause' }
    ],
    commonMistake: 'Mengira kalimat tidak butuh bentuk pasif hanya karena tidak ada kata "by".',
    strategy: 'Tanyakan: "Apakah Subject bisa melakukan kata kerja ini sendiri?" Jika tidak, wajib gunakan bentuk pasif.',
    relatedSkills: ['Skill 5', 'Skill 37'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The car parked (A) in a no-parking zone, (B) so it towed (C) away by the police (D).',
    options: [
      '(A) parked',
      '(B) zone',
      '(C) towed',
      '(D) by the police'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — "park" bisa digunakan secara intransitif.',
      '(B) Benar — Noun.',
      '(C) Salah (Harus diperbaiki) — Mobil ("it") tidak menderek dirinya sendiri melainkan diderek polisi, sehingga harus pasif "was towed".',
      '(D) Benar — Pelaku tindakan pasif.'
    ]
  },
  // Group L: Nouns (39-42)
  {
    num: 39, group: 'L', page: 'p. 287', title: 'Use the correct singular or plural noun',
    indonesianTitle: 'Gunakan Singular atau Plural Noun yang Tepat Sesuai Penanda Jumlah',
    objective: 'Mencocokkan kata benda tunggal atau jamak dengan kata penentu jumlah (determiner) di depannya.',
    explanation: 'Penanda tunggal (each, every, single, one, a) wajib diikuti Singular Noun. Penanda jamak (both, two, many, several, various) wajib diikuti Plural Noun.',
    formula: 'each / every / single / one / a + [Singular Noun]  |  both / many / several / various + [Plural Noun]',
    exampleEn: 'On the table there were many dish → (SALAH: "many dishes") | The lab assistant finished every tests → (SALAH: "every test")',
    exampleId: 'Di atas meja ada banyak piring. | Asisten lab menyelesaikan setiap ujian.',
    tokens: [
      { text: 'Several', role: 'Connector' },
      { text: 'experiments', role: 'Subject' },
      { text: 'were conducted', role: 'Verb' },
      { text: 'during the semester.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Lupa menambahkan akhiran "-s" setelah "many, several, various, two" atau justru menambahkan "-s" setelah "each/every".',
    strategy: 'Lihat kata penentu jumlah tepat di depan kata benda yang digarisbawahi.',
    relatedSkills: ['Skill 23', 'Skill 40', 'Skill 41'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The automotive shop (A) stocked many part (B) for the various types (C) of Hondas (D).',
    options: [
      '(A) automotive shop',
      '(B) many part',
      '(C) types',
      '(D) Hondas'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Benar — Noun tunggal.',
      '(B) Salah (Harus diperbaiki) — Kata "many" wajib diikuti kata benda jamak "parts".',
      '(C) Benar — Jamak setelah "various".',
      '(D) Benar — Kata benda jamak.'
    ]
  },
  {
    num: 40, group: 'L', page: 'p. 288', title: 'Distinguish countable and uncountable nouns',
    indonesianTitle: 'Bedakan Countable dan Uncountable Nouns',
    objective: 'Membedakan penanda untuk Countable Nouns (many, number, few, fewer) dengan penanda untuk Uncountable Nouns (much, amount, little, less).',
    explanation: 'Uncountable nouns (seperti information, advice, equipment, furniture, news, research, traffic, money, luggage) tidak memiliki bentuk jamak dan tidak boleh dipasangkan dengan "many, number, few, fewer".',
    formula: 'Countable: many / number / few / fewer  |  Uncountable: much / amount / little / less',
    exampleEn: 'He has seen much foreign films → (SALAH: "many") | He didn\'t have many fun → (SALAH: "much")',
    exampleId: 'Dia tidak mendapatkan banyak kesenangan di pesta itu.',
    tokens: [
      { text: 'A large amount of', role: 'Connector' },
      { text: 'research', role: 'Subject' },
      { text: 'has been done', role: 'Verb' },
      { text: 'on this topic.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Memakai "many/few/number of" untuk uncountable nouns seperti "information, work, equipment, homework".',
    strategy: 'Uji apakah kata benda tersebut bisa dihitung satu per satu (1, 2, 3...). Jika tidak bisa, gunakan much/amount/little/less.',
    relatedSkills: ['Skill 21', 'Skill 39'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'You will have fewer (A) problems with your income taxes if you get professional advices (B) before filing (C) your return (D).',
    options: [
      '(A) fewer',
      '(B) advices',
      '(C) filing',
      '(D) return'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Benar — "fewer" tepat untuk countable noun jamak "problems".',
      '(B) Salah (Harus diperbaiki) — "advice" adalah uncountable noun sehingga tidak boleh diberi akhiran "-s" (harus "advice").',
      '(C) Benar — Gerund setelah preposisi "before".',
      '(D) Benar — Noun.'
    ]
  },
  {
    num: 41, group: 'L', page: 'p. 290', title: 'Recognize irregular plurals of nouns',
    indonesianTitle: 'Kenali Bentuk Jamak Tidak Beraturan (Irregular Plurals — Appendix H)',
    objective: 'Mengenali kata benda jamak yang tidak berakhiran -s (seperti men, women, children, feet, teeth, mice, criteria, phenomena, alumni, bacteria, data, fungi, nuclei).',
    explanation: 'Bahasa Inggris menyerap banyak kata benda dari bahasa Latin dan Yunani yang bentuk jamaknya berbeda dari aturan "-s" biasa (Lihat Appendix H di Modul 7).',
    formula: 'criterion → criteria  |  phenomenon → phenomena  |  analysis → analyses  |  bacterium → bacteria',
    exampleEn: 'Different criteria was used to evaluate the performers → (SALAH: "criteria" jamak, harus "were used").',
    exampleId: 'Kriteria yang berbeda-beda digunakan untuk mengevaluasi para penampil.',
    tokens: [
      { text: 'These scientific phenomena', role: 'Subject' },
      { text: 'have puzzled', role: 'Verb' },
      { text: 'researchers', role: 'Clause' },
      { text: 'for decades.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Mengira kata berakhiran -a (criteria, phenomena, bacteria, data) adalah tunggal karena tidak berakhiran -s.',
    strategy: 'Hafalkan tabel Irregular Plurals di Appendix H (Modul 7).',
    relatedSkills: ['Skill 20', 'Skill 39'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'A strange phenomena (A) was observed (B) in the night sky (C) by several astronomers (D).',
    options: [
      '(A) phenomena',
      '(B) was observed',
      '(C) night sky',
      '(D) several astronomers'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Salah (Harus diperbaiki) — Didahului artikel "A" dan diikuti Verb tunggal "was observed", maka harus bentuk tunggal "phenomenon" ("phenomena" adalah jamak).',
      '(B) Benar — Verb tunggal pasif.',
      '(C) Benar — Noun phrase.',
      '(D) Benar — Jamak setelah "several".'
    ]
  },
  {
    num: 42, group: 'L', page: 'p. 291', title: 'Distinguish the person from the thing',
    indonesianTitle: 'Bedakan Kata Benda Orang (Person) vs Benda/Konsep (Thing)',
    objective: 'Memilih kata benda yang merujuk pada pelaku/orang (mis. accountant, critic, engineer, poet, sculptor) vs kata benda yang merujuk pada bidang/karya (accounting, criticism, engineering, poetry, sculpture).',
    explanation: 'TOEFL sering menukar kata benda "orang" dan kata benda "hal/bidang" yang berasal dari akar kata yang sama.',
    formula: 'Person: accountant, sculptor, poet, critic  |  Thing/Field: accounting, sculpture, poetry, criticism',
    exampleEn: 'Ralph Nader is an authorization in the field of consumer affairs → (SALAH: harusnya "an authority" untuk orang yang ahli).',
    exampleId: 'Ralph Nader adalah seorang pakar di bidang urusan konsumen.',
    tokens: [
      { text: 'The famous sculptor', role: 'Subject' },
      { text: 'displayed', role: 'Verb' },
      { text: 'his latest marble sculpture', role: 'Clause' },
      { text: 'at the gallery.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menulis "Michelangelo was a famous sculpture" (patung) alih-alih "sculptor" (pematung).',
    strategy: 'Perhatikan konteks kalimat apakah sedang membicarakan manusianya (person) atau bidang/hasil karyanya (thing).',
    relatedSkills: ['Skill 39', 'Skill 50'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'In the evening (A) he relaxes (B) in front of the fire (C) and writes long poets (D).',
    options: [
      '(A) In the evening',
      '(B) relaxes',
      '(C) in front of',
      '(D) poets'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Benar — Keterangan waktu.',
      '(B) Benar — Verb.',
      '(C) Benar — Preposition.',
      '(D) Salah (Harus diperbaiki) — Seseorang menulis puisi ("poems" atau "poetry"), bukan menulis penyair ("poets").'
    ]
  },
  // Group M: Pronouns (43-45)
  {
    num: 43, group: 'M', page: 'p. 294', title: 'Distinguish subject and object pronouns',
    indonesianTitle: 'Bedakan Subject Pronouns (I, he, she, we, they) vs Object Pronouns (me, him, her, us, them)',
    objective: 'Menempatkan Subject Pronoun pada posisi Subject dan Object Pronoun pada posisi Object kata kerja atau Object preposisi.',
    explanation: 'Subject pronoun digunakan sebagai pelaku tindakan atau setelah "be". Object pronoun digunakan setelah kata kerja transitif atau setelah preposisi (to, for, with, between, from).',
    formula: 'Subject: I, you, he, she, it, we, they  |  Object: me, you, him, her, it, us, them',
    exampleEn: 'Sally gave the book to John. → She gave it to him. (Jebakan: "between you and I" → SALAH; yang benar "between you and me")',
    exampleId: 'Di antara kamu dan saya, rahasia ini akan aman.',
    tokens: [
      { text: 'The professor', role: 'Subject' },
      { text: 'distributed', role: 'Verb' },
      { text: 'the syllabus', role: 'Clause' },
      { text: 'to us.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menggunakan Subject Pronoun setelah preposisi seperti "for you and I" atau "with he and she".',
    strategy: 'Jika kata ganti berada setelah preposisi (to, for, with, between), selalu gunakan Object Pronoun.',
    relatedSkills: ['Skill 2', 'Skill 44', 'Skill 45'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The secret agreement (A) between you and I (B) must never be revealed (C) to anyone else (D).',
    options: [
      '(A) secret agreement',
      '(B) you and I',
      '(C) be revealed',
      '(D) anyone else'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Benar — Noun phrase.',
      '(B) Salah (Harus diperbaiki) — Setelah preposisi "between" wajib memakai object pronoun "me", bukan subject pronoun "I".',
      '(C) Benar — Passive verb setelah modal.',
      '(D) Benar — Pronoun.'
    ]
  },
  {
    num: 44, group: 'M', page: 'p. 296', title: 'Distinguish possessive adjectives and pronouns',
    indonesianTitle: 'Bedakan Possessive Adjectives (my, their, its) vs Possessive Pronouns (mine, theirs)',
    objective: 'Menggunakan Possessive Adjective ketika diikuti oleh kata benda (Noun), dan Possessive Pronoun ketika berdiri sendiri menggantikan kata benda.',
    explanation: 'Possessive Adjective (my, your, his, her, its, our, their) WAJIB diikuti kata benda. Possessive Pronoun (mine, yours, his, hers, ours, theirs) TIDAK BOLEH diikuti kata benda.',
    formula: '[Possessive Adjective] + [Noun]  |  [Possessive Pronoun] (Berdiri Sendiri)',
    exampleEn: 'They lent us their book. (Adjective + Noun) | They lent us theirs. (Pronoun berdiri sendiri)',
    exampleId: 'Mereka meminjamkan buku mereka kepada kami.',
    tokens: [
      { text: 'Each student', role: 'Subject' },
      { text: 'must bring', role: 'Verb' },
      { text: 'his or her own laptop', role: 'Clause' },
      { text: 'to the workshop.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menulis "theirs books" atau menulis "its" dengan tanda apostrof ("it\'s" berarti "it is", bukan kepunyaan!).',
    strategy: 'Lihat kata tepat setelah kata ganti kepunyaan: jika ada kata benda, pakai my/your/his/her/its/our/their; jika tidak ada, pakai mine/yours/his/hers/ours/theirs.',
    relatedSkills: ['Skill 43', 'Skill 45'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'If she borrows (A) your coat, (B) then you should be able (C) to borrow her (D).',
    options: [
      '(A) borrows',
      '(B) your coat',
      '(C) should be able',
      '(D) her'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Benar — Verb.',
      '(B) Benar — Possessive adjective + noun.',
      '(C) Benar — Modal + verb.',
      '(D) Salah (Harus diperbaiki) — Karena tidak diikuti kata benda "coat", harus memakai possessive pronoun "hers".'
    ]
  },
  {
    num: 45, group: 'M', page: 'p. 298', title: 'Check pronoun reference for agreement',
    indonesianTitle: 'Periksa Kesesuaian Rujukan Pronoun (Singular vs Plural)',
    objective: 'Memastikan setiap kata ganti (he, she, it, they, him, her, them, its, their) sesuai jumlah dan jenisnya dengan kata benda rujukannya (antecedent).',
    explanation: 'Kata ganti tunggal (it, its, he, she) harus merujuk pada kata benda tunggal; kata ganti jamak (they, them, their) harus merujuk pada kata benda jamak.',
    formula: '[Singular Noun] ↔ [it / its / he / she]  |  [Plural Noun] ↔ [they / them / their]',
    exampleEn: 'The boys will cause trouble if you let him → (SALAH: "boys" jamak, harus "them") | Everyone must give their name → (Formal TOEFL: "his or her name")',
    exampleId: 'Anak-anak lelaki itu akan membuat masalah jika kamu membiarkan mereka.',
    tokens: [
      { text: 'The cookies', role: 'Subject' },
      { text: 'are', role: 'Verb' },
      { text: 'for you,', role: 'PrepPhrase' },
      { text: 'so please take them.', role: 'Clause' }
    ],
    commonMistake: 'Memakai "they/their" untuk merujuk pada kata benda tunggal seperti "a person", "each student", atau "the company".',
    strategy: 'Tarik panah mundur dari pronoun yang digarisbawahi menuju kata benda yang dirujuknya untuk mengecek tunggal/jamaknya.',
    relatedSkills: ['Skill 23', 'Skill 43', 'Skill 44'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'A person (A) really needs to be careful (B) about what they say (C) during a job interview (D).',
    options: [
      '(A) A person',
      '(B) careful',
      '(C) they say',
      '(D) job interview'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Subjek tunggal ("A person").',
      '(B) Benar — Adjective.',
      '(C) Salah (Harus diperbaiki) — Dalam tata bahasa baku TOEFL Longman, rujukan untuk "A person" (tunggal) harus tunggal ("he or she says").',
      '(D) Benar — Noun phrase.'
    ]
  },
  // Group N: Adjectives and Adverbs (46-48)
  {
    num: 46, group: 'N', page: 'p. 301', title: 'Use basic adjectives and adverbs correctly',
    indonesianTitle: 'Gunakan Adjectives dan Adverbs Sesuai Fungsinya',
    objective: 'Menggunakan Adjective untuk menerangkan Noun atau Pronoun, dan Adverb (umumnya berakhiran -ly) untuk menerangkan Verb, Adjective, atau Adverb lain.',
    explanation: 'Adjective menjawab pertanyaan "What kind?" (menerangkan kata benda), sedangkan Adverb menjawab pertanyaan "How/When/Where?" (menerangkan kata kerja atau kata sifat).',
    formula: '[Adjective] + [Noun]  |  [Verb] + [Adverb]  |  [Adverb] + [Adjective]',
    exampleEn: 'She is a beautiful woman. (Adj + Noun) | She sings beautifully. (Verb + Adv) | She is a truly beautifully dressed woman. (Adv + Adv + Adj + Noun)',
    exampleId: 'Dia menyanyi dengan indah. | Dia adalah wanita yang berpakaian sangat indah.',
    tokens: [
      { text: 'The surgeon', role: 'Subject' },
      { text: 'performed', role: 'Verb' },
      { text: 'the delicate operation', role: 'Clause' },
      { text: 'extremely carefully.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Memakai adjective untuk menerangkan verb (mis. "He drives careful") atau memakai adverb di depan noun (mis. "a carefully driver").',
    strategy: 'Tentukan kata mana yang sedang dijelaskan oleh kata yang digarisbawahi: jika menjelaskan Noun → Adjective; jika menjelaskan Verb/Adjective → Adverb.',
    relatedSkills: ['Skill 47', 'Skill 48'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The mother was pleasant (A) surprised (B) when her daughter (C) came to visit (D).',
    options: [
      '(A) pleasant',
      '(B) surprised',
      '(C) daughter',
      '(D) to visit'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Salah (Harus diperbaiki) — Menerangkan kata sifat "surprised", sehingga wajib berbentuk adverb "pleasantly".',
      '(B) Benar — Participial adjective.',
      '(C) Benar — Subject anak kalimat.',
      '(D) Benar — Infinitive.'
    ]
  },
  {
    num: 47, group: 'N', page: 'p. 303', title: 'Use adjectives after linking verbs',
    indonesianTitle: 'Gunakan Adjectives (Bukan Adverbs) setelah Linking Verbs',
    objective: 'Menggunakan Adjective setelah Linking Verbs (appear, be, become, feel, look, prove, seem, smell, taste) karena kata tersebut menerangkan Subject, bukan tindakan kata kerja.',
    explanation: 'Berbeda dengan kata kerja aksi biasa yang diikuti Adverb, Linking Verbs menghubungkan Subject dengan sifat Subject tersebut, sehingga harus diikuti Adjective (kecuali jika linking verb diikuti adverb yang menerangkan adjective lagi).',
    formula: '[Subject] + [Linking Verb (be, feel, look, seem, smell, taste, become, appear)] + [Adjective]',
    exampleEn: 'She spoke nicely. (Action verb + Adv)  vs.  She looks nice. (Linking verb + Adj)',
    exampleId: 'Dia berbicara dengan ramah vs. Dia tampak menarik.',
    tokens: [
      { text: 'The soup', role: 'Subject' },
      { text: 'tastes', role: 'Verb' },
      { text: 'wonderfully delicious.', role: 'Clause' }
    ],
    commonMistake: 'Menulis "She feels badly" atau "The flower smells sweetly" setelah linking verb.',
    strategy: 'Hafalkan daftar Linking Verbs: appear, be, become, feel, look, prove, seem, smell, taste.',
    relatedSkills: ['Skill 46', 'Skill 48'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The lawyer (A) felt badly (B) because he had lost (C) the important case (D).',
    options: [
      '(A) lawyer',
      '(B) badly',
      '(C) had lost',
      '(D) important case'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Benar — Subject.',
      '(B) Salah (Harus diperbaiki) — "felt" adalah linking verb yang menerangkan keadaan emosi subjek, sehingga harus memakai adjective "bad", bukan "badly".',
      '(C) Benar — Past perfect.',
      '(D) Benar — Noun phrase.'
    ]
  },
  {
    num: 48, group: 'N', page: 'p. 305', title: 'Position adjectives and adverbs correctly',
    indonesianTitle: 'Tempatkan Posisi Adjectives dan Adverbs dengan Benar',
    objective: 'Meletakkan Adjective sebelum Noun yang diterangkannya (bukan sesudahnya) dan tidak menyelipkan Adverb di antara Verb dan Direct Object-nya.',
    explanation: 'Ada dua aturan posisi krusial: (1) Adjective tunggal diletakkan SEBELUM Noun (mis. "an expensive car", bukan "a car expensive"), dan (2) Adverb TIDAK BOLEH diletakkan di antara Verb dan Object-nya (mis. "He took recently a trip" → SALAH!).',
    formula: '[Adjective] + [Noun]  |  [Verb] + [Object] + [Adverb]  (JANGAN: [Verb] + [Adverb] + [Object])',
    exampleEn: 'The information important is on the first page → (SALAH) | He has taken recently an English course → (SALAH)',
    exampleId: 'Informasi penting itu ada di halaman pertama.',
    tokens: [
      { text: 'She', role: 'Subject' },
      { text: 'completed', role: 'Verb' },
      { text: 'the assignment', role: 'Clause' },
      { text: 'quickly.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menyelipkan adverb keterangan waktu/cara di tengah-tengah antara kata kerja transitif dan objeknya.',
    strategy: 'Periksa urutan kata: jika ada adverb terjepit tepat di antara Verb dan Object, pindahkan adverb tersebut ke sebelum Verb atau setelah Object.',
    relatedSkills: ['Skill 46', 'Skill 47'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The store opened (A) with a sale (B) fantastic (C) on all winter clothing (D).',
    options: [
      '(A) opened',
      '(B) with a sale',
      '(C) fantastic',
      '(D) winter clothing'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Verb.',
      '(B) Benar — Preposition + article + noun.',
      '(C) Salah (Harus diperbaiki) — Adjective "fantastic" harus diletakkan sebelum noun "sale" ("a fantastic sale").',
      '(D) Benar — Noun phrase.'
    ]
  },
  // Group O: More Problems with Adjectives (49-51)
  {
    num: 49, group: 'O', page: 'p. 308', title: 'Recognize -ly adjectives',
    indonesianTitle: 'Kenali Kata Sifat Berakhiran -ly (-ly Adjectives)',
    objective: 'Mengenali bahwa beberapa kata berakhiran "-ly" sebenarnya adalah ADJECTIVE (bukan Adverb!), seperti costly, early, friendly, kindly, likely, lively, lonely, manly, daily, hourly, monthly, nightly, quarterly, weekly, yearly, lovely, northerly.',
    explanation: 'Tidak semua kata berakhiran -ly adalah adverb. Kata-kata seperti "friendly" atau "costly" adalah adjective dan sah digunakan untuk menerangkan kata benda.',
    formula: 'friendly, costly, lively, lovely, timely, daily, weekly, monthly, yearly = ADJECTIVE',
    exampleEn: 'The manager turned in his weekly report. ("weekly" = Adjective menerangkan "report")',
    exampleId: 'Manajer itu menyerahkan laporan mingguannya.',
    tokens: [
      { text: 'The new neighbor', role: 'Subject' },
      { text: 'gave us', role: 'Verb' },
      { text: 'a very friendly greeting.', role: 'Clause' }
    ],
    commonMistake: 'Mengira "friendly" atau "costly" salah di depan kata benda hanya karena berakhiran -ly.',
    strategy: 'Hafalkan daftar -ly adjectives yang sering keluar di TOEFL: costly, early, friendly, likely, lively, lonely, lovely, timely, daily/weekly/monthly/yearly.',
    relatedSkills: ['Skill 46', 'Skill 48'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The receptionist (A) welcomed all the visitors (B) in a very friend (C) manner (D).',
    options: [
      '(A) receptionist',
      '(B) visitors',
      '(C) friend',
      '(D) manner'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Subject.',
      '(B) Benar — Object.',
      '(C) Salah (Harus diperbaiki) — Untuk menerangkan noun "manner", dibutuhkan adjective "friendly", bukan noun "friend".',
      '(D) Benar — Noun.'
    ]
  },
  {
    num: 50, group: 'O', page: 'p. 309', title: 'Use predicate adjectives correctly',
    indonesianTitle: 'Gunakan Predicate Adjectives (alike, alive, alone, afraid, asleep) dengan Benar',
    objective: 'Meletakkan Predicate Adjectives (yang umumnya berawalan "a-") HANYA setelah Linking Verbs, TIDAK PERNAH tepat di depan kata benda.',
    explanation: 'Kata sifat tertentu (alike, alive, alone, afraid, asleep) hanya boleh muncul sebagai predikat setelah linking verb. Jika ingin diletakkan di depan kata benda, gunakan padanannya (like/similar, live/living, lone, frightened, sleeping).',
    formula: 'Predikat: [Noun] + [be] + [alike / alive / alone / afraid / asleep]  |  Depan Noun: [like / live / lone / frightened / sleeping] + [Noun]',
    exampleEn: 'The snake on the rock was alive. (BENAR)  vs.  The alive snake was lying on the rock. (SALAH: harusnya "live snake")',
    exampleId: 'Ular di atas batu itu masih hidup.',
    tokens: [
      { text: 'The two sisters', role: 'Subject' },
      { text: 'look', role: 'Verb' },
      { text: 'remarkably alike.', role: 'Clause' }
    ],
    commonMistake: 'Menulis "an alone man", "an asleep baby", atau "two alike dresses" di depan kata benda.',
    strategy: 'Setiap melihat kata sifat berawalan "a-" (alike, alive, alone, afraid, asleep), pastikan tidak ada kata benda tepat di belakangnya.',
    relatedSkills: ['Skill 47', 'Skill 48'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The biologist (A) carefully placed (B) the alive specimen (C) into a glass container (D).',
    options: [
      '(A) biologist',
      '(B) carefully placed',
      '(C) alive specimen',
      '(D) glass container'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Subject.',
      '(B) Benar — Adverb + Verb.',
      '(C) Salah (Harus diperbaiki) — "alive" adalah predicate adjective dan tidak boleh berada tepat di depan kata benda; gunakan "live" atau "living".',
      '(D) Benar — Noun phrase.'
    ]
  },
  {
    num: 51, group: 'O', page: 'p. 311', title: 'Use -ed and -ing adjectives correctly',
    indonesianTitle: 'Bedakan Kata Sifat -ed (Menerima Perasaan) vs -ing (Menyebabkan Perasaan)',
    objective: 'Memilih adjective berakhiran -ing untuk hal/orang yang MENYEBABKAN perasaan atau sifat aktif, dan adjective berakhiran -ed untuk orang/makhluk yang MERASAKAN efek tersebut.',
    explanation: 'Contoh klasik: "The lecture was boring" (kuliahnya menyebabkan kebosanan) vs "The students were bored" (para mahasiswa merasakan kebosanan).',
    formula: '-ing Adjective = Penyebab / Aktif  |  -ed Adjective = Penerima Efek / Merasakan',
    exampleEn: 'The woman cleans the car. → It is a cleaning woman. | The car is cleaned. → It is a cleaned car.',
    exampleId: 'Kuliah itu membosankan, sehingga para mahasiswa merasa bosan.',
    tokens: [
      { text: 'The audience', role: 'Subject' },
      { text: 'was deeply moved', role: 'Verb' },
      { text: 'by the inspiring speech.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menulis "I am very boring in this class" (artinya "Saya orang yang membosankan") padahal maksudnya "I am very bored" (Saya merasa bosan).',
    strategy: 'Tanyakan: "Apakah kata benda ini penyebab perasaan (-ing) atau yang merasakan (-ed)?"',
    relatedSkills: ['Skill 4', 'Skill 5'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The exciting (A) fans cheered loudly (B) when their team scored (C) the winning goal (D).',
    options: [
      '(A) exciting',
      '(B) loudly',
      '(C) scored',
      '(D) winning goal'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Salah (Harus diperbaiki) — Para penggemar ("fans") adalah pihak yang merasakan antusiasme, sehingga harus memakai "excited", bukan "exciting".',
      '(B) Benar — Adverb.',
      '(C) Benar — Verb.',
      '(D) Benar — Participial adjective aktif.'
    ]
  },
  // Group P: Articles (52-55)
  {
    num: 52, group: 'P', page: 'p. 314', title: 'Use articles with singular nouns',
    indonesianTitle: 'Wajib Gunakan Article (atau Determiner) untuk Singular Countable Nouns',
    objective: 'Memastikan setiap kata benda tunggal yang dapat dihitung (singular countable noun) selalu memiliki penentu (a, an, the, my, this, that, one), tidak pernah berdiri telanjang.',
    explanation: 'Dalam bahasa Inggris, singular countable noun seperti "book", "student", atau "problem" TIDAK BOLEH berdiri sendiri tanpa article atau determiner.',
    formula: 'Singular Countable Noun WAJIB didahului: [a / an / the / my / this / each / one]',
    exampleEn: 'I have money. (Uncountable: boleh tanpa article) | I have books. (Plural: boleh tanpa article) | I have a book. (Singular Countable: WAJIB pakai article)',
    exampleId: 'Saya punya sebuah buku.',
    tokens: [
      { text: 'Every researcher', role: 'Subject' },
      { text: 'needs', role: 'Verb' },
      { text: 'a reliable microscope', role: 'Clause' },
      { text: 'for cellular analysis.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menulis kata benda tunggal tanpa "a/an/the" seperti "He bought new car yesterday".',
    strategy: 'Jika melihat kata benda tunggal bisa dihitung tanpa "a/an/the/my/this", itu pasti salah.',
    relatedSkills: ['Skill 39', 'Skill 40', 'Skill 53'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'On her trip (A) to Europe, she visited (B) famous museum (C) in Paris (D).',
    options: [
      '(A) her trip',
      '(B) visited',
      '(C) famous museum',
      '(D) in Paris'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Possessive + singular noun.',
      '(B) Benar — Verb.',
      '(C) Salah (Harus diperbaiki) — "museum" adalah singular countable noun dan membutuhkan article ("a famous museum").',
      '(D) Benar — Nama kota.'
    ]
  },
  {
    num: 53, group: 'P', page: 'p. 315', title: 'Distinguish a and an',
    indonesianTitle: 'Bedakan Penggunaan "a" (Bunyi Konsonan) vs "an" (Bunyi Vokal)',
    objective: 'Memilih "a" atau "an" berdasarkan BUNYI awal kata berikutnya (pronunciation), bukan semata-mata huruf tulisannya.',
    explanation: 'Gunakan "a" sebelum bunyi konsonan (termasuk kata berhuruf "u" yang dibaca /yu/ seperti "university", "uniform", "European", atau "one" yang dibaca /w/). Gunakan "an" sebelum bunyi vokal (termasuk huruf "h" bisu seperti "hour", "honor", "heir").',
    formula: 'a + Bunyi Konsonan (a university, a European, a one-way street)  |  an + Bunyi Vokal (an hour, an honor, an umbrella)',
    exampleEn: 'a university, a hand, a one-dollar bill  vs.  an unhappy man, an hour, an MBA degree',
    exampleId: 'sebuah universitas (bunyi /y/) vs. satu jam (bunyi /a/).',
    tokens: [
      { text: 'It took', role: 'Verb' },
      { text: 'more than an hour', role: 'Subject' },
      { text: 'to reach', role: 'Clause' },
      { text: 'a unanimous decision.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menulis "an university" atau "a hour" karena hanya melihat huruf pertama tanpa memperhatikan cara membacanya.',
    strategy: 'Ucapkan kata setelah a/an di dalam hati untuk mendengar bunyi pertamanya (konsonan vs vokal).',
    relatedSkills: ['Skill 52', 'Skill 54'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The committee reached (A) an unanimous (B) agreement after (C) a three-hour meeting (D).',
    options: [
      '(A) reached',
      '(B) an unanimous',
      '(C) after',
      '(D) a three-hour'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Benar — Verb.',
      '(B) Salah (Harus diperbaiki) — Kata "unanimous" diawali bunyi konsonan /yu/, sehingga wajib menggunakan "a unanimous", bukan "an".',
      '(C) Benar — Preposition.',
      '(D) Benar — Bunyi konsonan /th/ memakai "a".'
    ]
  },
  {
    num: 54, group: 'P', page: 'p. 317', title: 'Make articles agree with nouns',
    indonesianTitle: 'Sesuaikan Article dengan Jumlah Kata Bendanya (Jangan Pakai a/an untuk Jamak!)',
    objective: 'Memastikan artikel tak tentu "a" dan "an" TIDAK PERNAH digunakan bersama kata benda jamak (plural nouns) maupun uncountable nouns.',
    explanation: 'Artikel "a/an" bermakna "satu" (tunggal). Oleh karena itu, "a/an" hanya bisa mendampingi singular countable noun.',
    formula: 'a / an + Singular Countable Noun ONLY  (TIDAK BOLEH dengan Plural atau Uncountable Noun)',
    exampleEn: 'He saw a new movies → (SALAH) | They traveled to a nearby mountains → (SALAH)',
    exampleId: 'Dia menonton film-film baru. (Tanpa "a").',
    tokens: [
      { text: 'She', role: 'Subject' },
      { text: 'bought', role: 'Verb' },
      { text: 'an interesting book', role: 'Clause' },
      { text: 'and several magazines.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Terlewat melihat huruf "-s" di akhir kata benda setelah "a/an" karena terhalang kata sifat panjang.',
    strategy: 'Setiap melihat "a" atau "an", lacak kata benda intinya di belakang adjective untuk memastikan bentuknya tunggal.',
    relatedSkills: ['Skill 39', 'Skill 52'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'The archaeologist (A) discovered a rare ancient coins (B) buried beneath (C) the temple floor (D).',
    options: [
      '(A) archaeologist',
      '(B) a rare ancient coins',
      '(C) buried beneath',
      '(D) temple floor'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Benar — Subject.',
      '(B) Salah (Harus diperbaiki) — "coins" adalah bentuk jamak sehingga tidak boleh didahului artikel "a".',
      '(C) Benar — Past participle.',
      '(D) Benar — Noun phrase.'
    ]
  },
  {
    num: 55, group: 'P', page: 'p. 318', title: 'Distinguish specific and general ideas',
    indonesianTitle: 'Bedakan Makna Spesifik ("the") vs Makna Umum ("a/an" atau Tanpa Article)',
    objective: 'Menggunakan "the" ketika pembicara dan pendengar sama-sama tahu objek spesifik yang dimaksud (atau unik seperti the sun, the Earth), dan "a/an" atau tanpa article untuk rujukan umum.',
    explanation: 'Gunakan "a/an" untuk menyebutkan satu dari banyak contoh umum ("Tom will bring a book" — buku apa saja), dan gunakan "the" untuk merujuk pada objek tertentu yang sudah jelas identitasnya ("Tom will bring the book that I lent him").',
    formula: 'Spesifik / Unik / Sudah Didefinisikan → the  |  Umum / Salah Satu dari Banyak → a / an / Ø',
    exampleEn: 'The sun rises in the east. (Unik: "the") | A baseball is round. (Umum: bola bisbol mana pun)',
    exampleId: 'Matahari terbit di sebelah timur.',
    tokens: [
      { text: 'The Pacific Ocean', role: 'Subject' },
      { text: 'is', role: 'Verb' },
      { text: 'the largest body of water', role: 'Clause' },
      { text: 'on Earth.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Memakai "a/an" untuk benda unik tunggal di dunia seperti "a moon" atau "an equator".',
    strategy: 'Periksa apakah kata benda tersebut unik atau dijelaskan secara spesifik oleh frasa di belakangnya.',
    relatedSkills: ['Skill 52', 'Skill 53'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'In astronomy, (A) a Moon (B) is Earth\'s only natural satellite (C) and orbits our planet (D) every 27.3 days.',
    options: [
      '(A) In astronomy',
      '(B) a Moon',
      '(C) natural satellite',
      '(D) orbits'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Benar — Bidang ilmu tanpa article.',
      '(B) Salah (Harus diperbaiki) — Bulan milik Bumi bersifat unik dan spesifik, sehingga wajib menggunakan "the Moon".',
      '(C) Benar — Noun phrase.',
      '(D) Benar — Verb tunggal.'
    ]
  },
  // Group Q: Prepositions (56-57)
  {
    num: 56, group: 'Q', page: 'p. 321', title: 'Recognize incorrect prepositions',
    indonesianTitle: 'Kenali Penggunaan Preposisi yang Tidak Tepat (Appendix D)',
    objective: 'Memilih preposisi yang sesuai dengan pasangan idiom kata kerja, kata sifat, maupun penanda waktu/tempat baku (mis. depend on, afraid of, interested in, on Monday, in May, at 5:00).',
    explanation: 'Penggunaan preposisi dalam bahasa Inggris bersifat idiomatik (Lihat Appendix D di Modul 7). Kesalahan sering terjadi saat preposisi diganti dengan kata depan yang tidak berpasangan secara baku.',
    formula: 'depend on • interested in • responsible for • according to • in spite of / despite',
    exampleEn: 'The game was called on because of rain → (SALAH: "called off") | I knew I could count in you → (SALAH: "count on you")',
    exampleId: 'Saya tahu saya bisa mengandalkanmu ("count on you").',
    tokens: [
      { text: 'Success in college', role: 'Subject' },
      { text: 'depends heavily on', role: 'Verb' },
      { text: 'consistent study habits.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menerjemahkan preposisi langsung dari Bahasa Indonesia (mis. "depend from" atau "married with" alih-alih "depend on" dan "married to").',
    strategy: 'Pelajari kombinasi Prepositions & Phrasal Verbs di Appendix B dan Appendix D (Modul 7).',
    relatedSkills: ['Skill 57', 'Appendix D'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'According with (A) the latest census report, (B) the population of the city (C) has doubled (D).',
    options: [
      '(A) According with',
      '(B) census report',
      '(C) population',
      '(D) has doubled'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Salah (Harus diperbaiki) — Pasangan preposisi baku adalah "According to", bukan "According with".',
      '(B) Benar — Noun phrase.',
      '(C) Benar — Subject.',
      '(D) Benar — Present perfect verb.'
    ]
  },
  {
    num: 57, group: 'Q', page: 'p. 322', title: 'Recognize when prepositions have been omitted',
    indonesianTitle: 'Kenali Preposisi yang Terlewat (Omitted Prepositions)',
    objective: 'Mendeteksi kalimat di mana preposisi wajib dihilangkan padahal kata kerja atau ungkapan tersebut tidak bisa langsung diikuti objek tanpa preposisi.',
    explanation: 'Beberapa kata kerja (seperti listen to, wait for, look at, apply for, apologize for) wajib memakai preposisi sebelum objeknya.',
    formula: 'listen to + Object • wait for + Object • apologize for + Object • approve of + Object',
    exampleEn: 'Can you wait me after the game? → (SALAH: "wait for me") | I plan on attending the meeting → (BENAR)',
    exampleId: 'Bisakah kamu menungguku ("wait for me") setelah pertandingan?',
    tokens: [
      { text: 'The students', role: 'Subject' },
      { text: 'listened attentively to', role: 'Verb' },
      { text: 'the guest lecturer.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Menghilangkan preposisi wajib karena pengaruh bahasa ibu (mis. "listen the music" tanpa "to").',
    strategy: 'Periksa apakah kata kerja intransitif membutuhkan preposisi sebelum bertemu objeknya.',
    relatedSkills: ['Skill 56', 'Appendix D'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'If you take this job, (A) it will be necessary (B) to deal (C) other departments regularly (D).',
    options: [
      '(A) take this job',
      '(B) necessary',
      '(C) to deal',
      '(D) regularly'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Verb + object.',
      '(B) Benar — Adjective.',
      '(C) Salah (Harus diperbaiki) — Kata kerja "deal" membutuhkan preposisi "with" sebelum objek ("to deal with other departments").',
      '(D) Benar — Adverb.'
    ]
  },
  // Group R: Usage (58-60)
  {
    num: 58, group: 'R', page: 'p. 325', title: 'Distinguish make and do',
    indonesianTitle: 'Bedakan Penggunaan Kata Kerja "make" vs "do"',
    objective: 'Memilih "make" untuk aktivitas menciptakan, membangun, atau menghasilkan sesuatu, dan "do" untuk melaksanakan tugas, pekerjaan, atau aktivitas umum.',
    explanation: 'Kolokasi baku TOEFL: MAKE (a mistake, a decision, a plan, money, progress, an effort, a comparison, a suggestion) vs DO (homework, housework, research, business, a favor, one\'s best, an assignment, work).',
    formula: 'MAKE = Menciptakan / Menghasilkan (make a decision, make progress)  |  DO = Mengerjakan Tugas (do research, do homework)',
    exampleEn: 'She likes to do her own clothes → (SALAH: "make her own clothes") | Please make your homework → (SALAH: "do your homework")',
    exampleId: 'Dia sedang melakukan penelitian ("doing research") di laboratorium.',
    tokens: [
      { text: 'The committee', role: 'Subject' },
      { text: 'made', role: 'Verb' },
      { text: 'a unanimous decision', role: 'Clause' },
      { text: 'after doing extensive research.', role: 'PrepPhrase' }
    ],
    commonMistake: 'Tertukar antara "make research" (salah; harus "do research") dan "do a mistake" (salah; harus "make a mistake").',
    strategy: 'Hafalkan pasangan kolokasi utama "make" dan "do" dalam konteks akademik.',
    relatedSkills: ['Skill 59', 'Skill 60'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'Before making (A) a final conclusion, (B) the scientists must make (C) more laboratory research (D).',
    options: [
      '(A) making',
      '(B) final conclusion',
      '(C) make',
      '(D) laboratory research'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — "make a conclusion" sudah tepat.',
      '(B) Benar — Noun phrase.',
      '(C) Salah (Harus diperbaiki) — Kolokasi untuk "research" adalah "do research", bukan "make research".',
      '(D) Benar — Uncountable noun phrase.'
    ]
  },
  {
    num: 59, group: 'R', page: 'p. 326', title: 'Distinguish like, alike, and unlike',
    indonesianTitle: 'Bedakan Penggunaan "like", "alike", dan "unlike"',
    objective: 'Membedakan fungsi "alike" (predicate adjective setelah linking verb) dengan "like" dan "unlike" (preposisi di depan kata benda).',
    explanation: '"Alike" adalah predicate adjective (tidak boleh diikuti noun). "Like" (serupa dengan) dan "unlike" (berbeda dengan) adalah preposisi sehingga WAJIB diikuti noun/pronoun.',
    formula: '[A] and [B] are alike. (Predicate Adj)  |  Like [A], [B]... / Unlike [A], [B]... (Preposition + Noun)',
    exampleEn: 'John and Tom are alike. | John is like Tom. | Unlike Tom, John is very tall.',
    exampleId: 'John dan Tom mirip. | Tidak seperti Tom, John sangat tinggi.',
    tokens: [
      { text: 'Unlike', role: 'Connector' },
      { text: 'his older brother,', role: 'PrepPhrase' },
      { text: 'Mark', role: 'Subject' },
      { text: 'prefers', role: 'Verb' },
      { text: 'classical music.', role: 'Clause' }
    ],
    commonMistake: 'Menulis "Alike his brother..." di awal kalimat (seharusnya "Like his brother...") atau menulis "They are like" di akhir kalimat tanpa objek (seharusnya "They are alike").',
    strategy: 'Cek apakah ada kata benda di belakangnya: jika ada noun → pakai "like" atau "unlike"; jika di akhir klausa setelah "be" → pakai "alike".',
    relatedSkills: ['Skill 50', 'Skill 60'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'Alike (A) many other mammals, (B) bats navigate in complete darkness (C) using echolocation (D).',
    options: [
      '(A) Alike',
      '(B) other mammals',
      '(C) complete darkness',
      '(D) using echolocation'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Salah (Harus diperbaiki) — Karena diikuti frasa kata benda "many other mammals", harus memakai preposisi "Like", bukan predicate adjective "Alike".',
      '(B) Benar — Noun phrase.',
      '(C) Benar — Noun phrase.',
      '(D) Benar — Participial phrase.'
    ]
  },
  {
    num: 60, group: 'R', page: 'p. 328', title: 'Distinguish other, another, and others',
    indonesianTitle: 'Bedakan Penggunaan "other", "another", dan "others"',
    objective: 'Memilih "another" untuk satu tambahan tunggal tak tentu, "other" sebagai adjective di depan kata benda jamak/tak terhitung (atau setelah "the"), dan "others" sebagai pronoun jamak yang berdiri sendiri.',
    explanation: 'Kunci membedakan ketiganya adalah melihat apakah kata tersebut tunggal atau jamak, spesifik ("the") atau umum, dan apakah diikuti kata benda atau berdiri sendiri.',
    formula: 'Singular Tak Tentu: another (+ Singular Noun)  |  Plural Tak Tentu: other + Plural Noun  ATAU  others (Pronoun)  |  Spesifik: the other (+ Noun) / the others',
    exampleEn: 'I have another book. | I have other books. | I have others. | I have the other book / the other books / the others.',
    exampleId: 'Saya punya buku lain (satu) vs. Saya punya buku-buku lain (jamak).',
    tokens: [
      { text: 'Some students', role: 'Subject' },
      { text: 'prefer', role: 'Verb' },
      { text: 'studying in the morning,', role: 'Clause' },
      { text: 'while others', role: 'Subject' },
      { text: 'study at night.', role: 'Verb' }
    ],
    commonMistake: 'Menulis "another books" (salah; harus "other books") atau "others books" (salah; "others" tidak boleh diikuti kata benda).',
    strategy: 'Periksa kata di belakangnya: jika ada kata benda jamak → pakai "other"; jika tunggal tak tentu → "another"; jika tidak ada kata benda dan jamak → "others".',
    relatedSkills: ['Skill 39', 'Skill 44'],
    questionType: 'Written Expression (Error Spotting)',
    question: 'Some of the plants (A) in the garden require full sunlight, (B) whereas another (C) thrive in the shade (D).',
    options: [
      '(A) Some of the plants',
      '(B) full sunlight',
      '(C) another',
      '(D) in the shade'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Benar — Subjek jamak.',
      '(B) Benar — Noun phrase.',
      '(C) Salah (Harus diperbaiki) — Merujuk pada tanaman-tanaman lain secara jamak (terlihat dari Verb jamak "thrive") dan berdiri sendiri tanpa kata benda, sehingga harus memakai "others".',
      '(D) Benar — Prepositional phrase.'
    ]
  }
];

// ============================================================================
// 4. READING MASTERCLASS DATA (ALL 14 SKILLS, pp. 368–451)
// ============================================================================

const READING_GROUPS = [
  { id: 'A', name: 'A. Ideas of the Passage (Skills 1–2)', pages: 'pp. 368–378' },
  { id: 'B', name: 'B. Directly Answered Questions (Skills 3–5)', pages: 'pp. 379–397' },
  { id: 'C', name: 'C. Indirectly Answered Questions (Skills 6–7)', pages: 'pp. 398–410' },
  { id: 'D', name: 'D. Vocabulary Questions (Skills 8–11)', pages: 'pp. 411–430' },
  { id: 'E', name: 'E. Overall Review Questions (Skills 12–14)', pages: 'pp. 431–451' }
];

const RAW_READING_SKILLS = [
  {
    num: 1, group: 'A', page: 'p. 368', title: 'Answer main idea questions correctly',
    indonesianTitle: 'Jawab Pertanyaan Ide Pokok (Main Idea / Topic / Title) dengan Tepat',
    explanation: 'Pertanyaan Main Idea (What is the topic/subject/main idea/best title of the passage?) selalu dijawab dengan membaca kalimat pertama dari setiap paragraf dan menggabungkannya menjadi satu tema menyeluruh.',
    whereToFind: 'Kalimat pertama pada setiap paragraf teks bacaan.',
    strategy: 'Baca baris pertama tiap paragraf → Temukan tema umum yang menyatukan semuanya → Singkirkan opsi yang terlalu sempit (hanya membahas 1 detail), terlalu luas, atau tidak sesuai fakta bacaan.',
    passageTitle: 'Hurricanes in the North Atlantic',
    sentences: [
      'In the philosophy of John Dewey, a sharp distinction is made between intelligence and reasoning.',
      'According to Dewey, intelligence is the only absolute way to achieve a balance between realism and idealism, between practicality and wisdom of life.',
      'Intelligence involves "interacting with other things and knowing them," while reasoning is merely the act of an observer, "...a mind that beholds or grasps objects outside the world of things...."',
      'With reasoning, a level of mental certainty can be achieved, but it is through intelligence that control is taken of events that shape one\'s life.'
    ],
    highlightIndices: [0],
    question: 'What is the topic of this passage?',
    options: [
      '(A) The intelligence of John Dewey',
      '(B) Distinctions made by John Dewey',
      '(C) Dewey\'s ideas on the ability to reason',
      '(D) How intelligence differs from reasoning in Dewey\'s works'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — Terlalu sempit dan salah fokus (bukan tentang kecerdasan pribadi Dewey).',
      '(B) Salah — Terlalu luas (tidak menyebutkan topik spesifik yang dibedakan).',
      '(C) Salah — Hanya membahas "reasoning", melupakan "intelligence".',
      '(D) Benar — Mencakup kedua konsep utama ("intelligence" dan "reasoning") serta perbedaannya menurut Dewey.'
    ]
  },
  {
    num: 2, group: 'A', page: 'p. 373', title: 'Recognize the organization of ideas',
    indonesianTitle: 'Kenali Pola Organisasi Ide Antar-Paragraf',
    explanation: 'Pertanyaan "How is the information in the passage organized?" atau "How does the second paragraph relate to the first?" meminta Anda melihat hubungan struktur antar-paragraf.',
    whereToFind: 'Kalimat pertama dari masing-masing paragraf dan kata transisi antar-paragraf.',
    strategy: 'Bandingkan kalimat pertama Paragraf 1, Paragraf 2, dan Paragraf 3 untuk melihat apakah polanya definisi → contoh, sebab → akibat, atau perbandingan dua pandangan.',
    passageTitle: 'Conflict Theory vs. Functionalism',
    sentences: [
      'Conflict within an organization is not always viewed as undesirable.',
      'In traditional management theory, conflict was seen as a destructive force that had to be eliminated immediately to maintain productivity.',
      'In contrast, modern behavioral theorists argue that a moderate level of conflict stimulates creativity, prevents stagnation, and encourages critical evaluation.'
    ],
    highlightIndices: [1, 2],
    question: 'How is the information in the passage organized?',
    options: [
      '(A) A chronological history of corporate mergers',
      '(B) A contrast between traditional and modern views of organizational conflict',
      '(C) A step-by-step manual for resolving workplace disputes',
      '(D) A classification of different types of organizations'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Tidak membahas sejarah merger.',
      '(B) Benar — Membandingkan pandangan tradisional ("destructive force") dengan pandangan modern ("stimulates creativity").',
      '(C) Salah — Tidak memberikan panduan langkah demi langkah.',
      '(D) Salah — Tidak mengklasifikasikan jenis organisasi.'
    ]
  },
  {
    num: 3, group: 'B', page: 'p. 379', title: 'Answer stated detail questions correctly',
    indonesianTitle: 'Jawab Pertanyaan Detail Tersurat (Stated Detail Questions)',
    explanation: 'Stated detail question menanyakan satu informasi spesifik yang tertulis langsung di dalam bacaan. Jawaban benar adalah parafrase (sinonim) dari kalimat yang ada di teks.',
    whereToFind: 'Urutan jawaban pertanyaan selalu berurutan dari atas ke bawah dalam bacaan.',
    strategy: 'Pilih kata kunci dari pertanyaan → Pindai (scan) kata kunci tersebut di dalam teks → Baca kalimat yang memuat kata kunci dengan teliti → Pilih opsi yang memparafrasekan kalimat tersebut.',
    passageTitle: 'Williamsburg, Virginia',
    sentences: [
      'Williamsburg is a historic city in Virginia that was settled by English colonists in 1633, twenty-six years after the first permanent English colony in America was settled at Jamestown.',
      'In the beginning, the colony at Williamsburg was named Middle Plantation because of its location in the middle of a peninsula between two rivers, the York and the James.',
      'The site for Williamsburg had been selected by the colonists because the soil drainage was better there than at the Jamestown location, and there were fewer mosquitoes.'
    ],
    highlightIndices: [1],
    question: 'The passage indicates that Jamestown _______',
    options: [
      '(A) was settled in 1633',
      '(B) was settled twenty-six years after Williamsburg',
      '(C) was the first permanent English colony in America',
      '(D) was originally named Middle Plantation'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Williamsburg yang didirikan tahun 1633.',
      '(B) Salah — Terbalik: Williamsburg didirikan 26 tahun SETELAH Jamestown.',
      '(C) Benar — Tersurat jelas pada kalimat pertama ("twenty-six years after the first permanent English colony in America was settled at Jamestown").',
      '(D) Salah — Middle Plantation adalah nama awal Williamsburg.'
    ]
  },
  {
    num: 4, group: 'B', page: 'p. 385', title: 'Find "unstated" details',
    indonesianTitle: 'Temukan Detail yang TIDAK Disebutkan atau Salah (NOT / EXCEPT)',
    explanation: 'Pertanyaan yang mengandung kata NOT, EXCEPT, atau FALSE meminta Anda mencari SATU opsi yang salah atau tidak disebutkan di teks, sementara tiga opsi lainnya benar menurut teks.',
    whereToFind: 'Di bagian teks yang memuat kata kunci pertanyaan.',
    strategy: 'Pindai kata kunci pertanyaan → Cek satu per satu 4 opsi jawaban terhadap teks → Tiga opsi akan sesuai dengan teks (singkirkan), dan satu opsi yang bertentangan/tidak ada adalah jawabannya.',
    passageTitle: 'Blood Plasma Composition',
    sentences: [
      'Blood plasma is a clear, almost colorless liquid.',
      'It consists of blood from which the red and white blood cells have been removed.',
      'It is often used in transfusions because a patient generally needs the plasma portion of the blood more than the other components.',
      'Plasma differs in several important ways from whole blood: first, plasma can be mixed for all donors without matching blood types, and second, dried plasma can be stored longer than whole blood.'
    ],
    highlightIndices: [0, 1, 3],
    question: 'All of the following are true about blood plasma EXCEPT that _______',
    options: [
      '(A) it is a deeply colored liquid',
      '(B) blood cells have been taken out of it',
      '(C) patients are often transfused with it',
      '(D) it is generally more important to the patient than other parts of whole blood'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Benar (Ini jawaban yang dicari) — Teks menyatakan plasma adalah "clear, almost colorless liquid", bertentangan dengan "deeply colored".',
      '(B) Salah — Sesuai kalimat 2 ("red and white blood cells have been removed").',
      '(C) Salah — Sesuai kalimat 3 ("often used in transfusions").',
      '(D) Salah — Sesuai kalimat 3 ("needs the plasma portion... more than the other components").'
    ]
  },
  {
    num: 5, group: 'B', page: 'p. 388', title: 'Find pronoun referents',
    indonesianTitle: 'Temukan Kata Benda yang Dirujuk oleh Pronoun',
    explanation: 'Pertanyaan "The pronoun \'they\' in line X refers to..." menguji kemampuan melacak kata benda (antecedent) sebelum kata ganti tersebut. Pada CBT, Anda diminta mengklik langsung kata benda rujukannya di layar.',
    whereToFind: 'Selalu berada SEBELUM kata ganti tersebut di dalam teks (biasanya pada kalimat yang sama atau satu kalimat sebelumnya).',
    strategy: 'Temukan pronoun yang ditanyakan → Baca mundur ke depan kalimat → Cocokkan jumlah (tunggal vs jamak) dan substitusikan kandidat kata benda ke posisi pronoun untuk menguji kelogisannya.',
    interactivePronoun: {
      pronoun: 'They',
      targetWord: 'Carnivorous plants',
      sentenceIdx: 1
    },
    passageTitle: 'Carnivorous Plants',
    sentences: [
      'Carnivorous plants, such as the sundew and the Venus flytrap, are generally found in humid areas where there is an inadequate supply of nitrogen in the soil.',
      'In order to survive, these plants have developed mechanisms to trap insects within their foliage.',
      'They have digestive fluids to obtain the necessary nitrogen from the insects.'
    ],
    highlightIndices: [0, 2],
    question: 'The pronoun "They" in the third sentence refers to _______',
    options: [
      '(A) humid areas',
      '(B) these plants',
      '(C) insects',
      '(D) digestive fluids'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Area lembap tidak memiliki cairan pencernaan.',
      '(B) Benar — "these plants" (Carnivorous plants) memiliki cairan pencernaan untuk menyerap nitrogen dari serangga.',
      '(C) Salah — Serangga adalah mangsa yang dicerna.',
      '(D) Salah — "digestive fluids" adalah objek dari kata kerja "have".'
    ]
  },
  {
    num: 6, group: 'C', page: 'p. 398', title: 'Answer implied detail questions correctly',
    indonesianTitle: 'Jawab Pertanyaan Detail Tersirat (Implied / Inferred / Likely)',
    explanation: 'Pertanyaan yang mengandung kata implied, inferred, likely, atau probably meminta Anda menarik kesimpulan logis berdasarkan informasi yang ada di bacaan.',
    whereToFind: 'Kalimat yang memuat kata kunci pertanyaan di dalam bacaan.',
    strategy: 'Temukan kata kunci di teks → Baca kalimat tersebut dengan teliti → Pilih kesimpulan logis yang paling dekat dengan fakta teks tanpa berspekulasi berlebihan.',
    passageTitle: 'The Hawaiian Language',
    sentences: [
      'The Hawaiian language is a melodious language in which all words are derived from an alphabet of only twelve letters, the five vowels a, e, i, o, u and the seven consonants h, k, l, m, n, p, w.',
      'Each syllable in the language ends in a vowel, and two consonants never appear together, so vowels have a much higher frequency in the Hawaiian language than they do in English.'
    ],
    highlightIndices: [0, 1],
    question: 'It is implied in the passage that a luau is _______',
    options: [
      '(A) a dance',
      '(B) a feast',
      '(C) a concert',
      '(D) a language'
    ],
    correct: 3,
    optionAnalysis: [
      '(A) Salah — Tidak disebutkan dalam teks.',
      '(B) Salah — Pengetahuan luar teks; teks hanya membahas struktur huruf bahasa Hawaii.',
      '(C) Salah — Tidak disebutkan.',
      '(D) Benar (dalam konteks soal TOEFL Longman pada teks ini: kata "luau" mengikuti pola vokal bahasa Hawaii, dan teks membahas bahasa).'
    ]
  },
  {
    num: 7, group: 'C', page: 'p. 402', title: 'Answer transition questions correctly',
    indonesianTitle: 'Jawab Pertanyaan Transisi (Paragraf Sebelumnya / Berikutnya)',
    explanation: 'Pertanyaan "The paragraph preceding this passage probably..." (paragraf sebelumnya) dijawab dari kalimat PERTAMA bacaan; sedangkan "What is most likely in the paragraph following this passage?" (paragraf berikutnya) dijawab dari kalimat TERAKHIR bacaan.',
    whereToFind: 'Preceding = Baris pertama teks  |  Following = Baris terakhir teks.',
    strategy: 'Untuk "preceding", lihat topik yang diperkenalkan di kalimat pertama. Untuk "following", lihat topik baru yang disinggung di kalimat terakhir.',
    passageTitle: 'Another Myth of the Sea',
    sentences: [
      'Another myth of the oceans concerns Davy Jones, who in folklore is a mean-spirited sovereign of the ocean\'s depths.',
      'The name "Jones" is thought by some etymologists to have been derived from the name "Jonah," the Hebrew prophet who spent three days in a whale\'s belly.',
      'According to tradition, any object that goes overboard and sinks to the bottom of the ocean is said to have gone to Davy Jones\'s locker, the ocean-sized, mythical receptacle for anything that falls into the water.'
    ],
    highlightIndices: [0],
    question: 'The paragraph preceding this passage most probably discusses _______',
    options: [
      '(A) the youth of Davy Jones',
      '(B) Davy Jones\'s career as a sailor',
      '(C) a different traditional story from the sea',
      '(D) preparing to travel on the ocean'
    ],
    correct: 2,
    optionAnalysis: [
      '(A) Salah — Davy Jones baru diperkenalkan di paragraf ini.',
      '(B) Salah — Tidak sesuai transisi "Another myth of the oceans".',
      '(C) Benar — Frasa pembuka "Another myth of the oceans" menyiratkan bahwa paragraf sebelumnya membahas mitos laut yang lain.',
      '(D) Salah — Tidak berhubungan.'
    ]
  },
  {
    num: 8, group: 'D', page: 'p. 411', title: 'Find definitions from structural clues',
    indonesianTitle: 'Temukan Arti Kosakata dari Petunjuk Struktural (Structural Clues)',
    explanation: 'Penulis teks akademik sering menyisipkan definisi kata sulit secara langsung menggunakan tanda baca (koma, tanda kurung, tanda pisah —), pernyataan ulang (or, that is, in other words, i.e.), atau contoh (such as, for example, e.g.).',
    whereToFind: 'Tepat sebelum atau sesudah kata yang ditanyakan dalam kalimat yang sama.',
    strategy: 'Perhatikan tanda koma, kurung, dash (—), atau kata "or / that is / such as" di sekitar kata yang ditanyakan.',
    passageTitle: 'Behaviorism in Psychology',
    sentences: [
      'One of the leading schools of psychological thought in the twentieth century is behaviorism—the belief that the role of the psychologist is to study behavior, which is observable, rather than conscious or unconscious thought, which is not.'
    ],
    highlightIndices: [0],
    question: 'In the passage, "behaviorism" is defined as _______',
    options: [
      '(A) a school of psychological thought focused on observable behavior',
      '(B) the study of unconscious dreams',
      '(C) a nineteenth-century medical procedure',
      '(D) an educational curriculum for children'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Benar — Definisi langsung diberikan tepat setelah tanda pisah (—): "the belief that the role of the psychologist is to study behavior, which is observable...".',
      '(B) Salah — Teks menyatakan behaviorism justru TIDAK mempelajari pikiran bawah sadar.',
      '(C) Salah — Abad ke-20, bukan ke-19.',
      '(D) Salah — Tidak disebutkan.'
    ]
  },
  {
    num: 9, group: 'D', page: 'p. 415', title: 'Determine meanings from word parts',
    indonesianTitle: 'Tentukan Makna Kata dari Bagian Kata (Prefixes, Roots, Suffixes — Appendix I)',
    explanation: 'Anda dapat memecah kata sulit menjadi awalan (prefix), akar kata (root), dan akhiran (suffix)—seperti "sub-" (bawah), "terr-" (bumi), "-anean" (berkaitan dengan) → "subterranean" = di bawah tanah (Lihat Appendix I di Modul 7).',
    whereToFind: 'Struktur internal kata yang ditanyakan ditambah konteks kalimat.',
    strategy: 'Pecah kata menjadi bagian-bagian kecil menggunakan daftar Word Parts di Appendix I.',
    passageTitle: 'Ring of Fire',
    sentences: [
      'Ring of Fire is the name of a gigantic ring of volcanic and seismic activity that encircles the Pacific Ocean, where subterranean tectonic plates constantly collide and shift.'
    ],
    highlightIndices: [0],
    question: 'The word "subterranean" in the passage is closest in meaning to _______',
    options: [
      '(A) underwater',
      '(B) underground',
      '(C) atmospheric',
      '(D) coastal'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — "sub-" (bawah) + "terr-" (bumi/tanah), bukan air ("aqua/mar").',
      '(B) Benar — "sub-" (di bawah) + "terra" (bumi/tanah) = di bawah tanah ("underground").',
      '(C) Salah — Atmosfer berada di udara.',
      '(D) Salah — Pesisir.'
    ]
  },
  {
    num: 10, group: 'D', page: 'p. 419', title: 'Use context to determine meanings of difficult words',
    indonesianTitle: 'Gunakan Konteks Kalimat untuk Menebak Arti Kata Sulit',
    explanation: 'Ketika tidak ada definisi langsung maupun akar kata yang dikenal, gunakan konteks kalimat di sekitar kata tersebut untuk menentukan arti yang paling logis.',
    whereToFind: 'Kalimat yang memuat kata tersebut serta kalimat sebelum/sesudahnya.',
    strategy: 'Gantikan kata sulit dengan masing-masing opsi jawaban dan baca kembali kalimatnya untuk melihat mana yang paling masuk akal.',
    passageTitle: 'The Roosevelt Corollary',
    sentences: [
      'In a government election, the incumbent generally has a strong advantage over a newcomer because the person currently holding the office already has public recognition and campaign resources.'
    ],
    highlightIndices: [0],
    question: 'An "incumbent" in the passage is most likely _______',
    options: [
      '(A) a first-time candidate',
      '(B) the current officeholder',
      '(C) a campaign donor',
      '(D) a retired politician'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Dikontraskan dengan "newcomer".',
      '(B) Benar — Dijelaskan pada klausa berikutnya: "the person currently holding the office".',
      '(C) Salah — Tidak sesuai.',
      '(D) Salah — Tidak sesuai.'
    ]
  },
  {
    num: 11, group: 'D', page: 'p. 422', title: 'Use context to determine meanings of simple words',
    indonesianTitle: 'Tentukan Arti Kontekstual dari Kata Sederhana yang Punya Banyak Makna',
    explanation: 'TOEFL sering menanyakan kata yang tampak sederhana (seperti "steps", "face", "run", "stage", "harbor") tetapi digunakan dalam makna sekunder sesuai konteks bacaan.',
    whereToFind: 'Kalimat tempat kata sederhana tersebut berada.',
    strategy: 'Jangan langsung memilih arti pertama yang terlintas di kepala; masukkan setiap opsi ke dalam kalimat bacaan untuk menguji makna kontekstualnya.',
    passageTitle: 'The "Face" of a Clock',
    sentences: [
      'The "face" of a clock is the front part of the timepiece that displays the numbers and hands, allowing observers to read the exact hour and minute.'
    ],
    highlightIndices: [0],
    question: 'The word "face" in the passage could best be replaced by _______',
    options: [
      '(A) expression',
      '(B) front surface',
      '(C) human head',
      '(D) courage'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Tidak cocok untuk jam.',
      '(B) Benar — Dijelaskan langsung sebagai "the front part of the timepiece".',
      '(C) Salah — Makna literal manusia.',
      '(D) Salah — Makna idiomatik "face danger".'
    ]
  },
  {
    num: 12, group: 'E', page: 'p. 431', title: 'Determine where specific information is found',
    indonesianTitle: 'Tentukan Di Mana (Baris / Kalimat Mana) Informasi Spesifik Ditemukan',
    explanation: 'Pada format PBT, pertanyaan menanyakan "In what lines does the author discuss...?". Pada format CBT, Anda diminta mengklik kalimat spesifik di dalam teks yang menjawab pertanyaan.',
    whereToFind: 'Pindai kata kunci dari pertanyaan di seluruh paragraf bacaan.',
    strategy: 'Cari kata kunci dari pertanyaan, temukan kalimat yang memuat ide tersebut, lalu cocokkan nomor baris/kalimatnya.',
    passageTitle: 'Meteor Crater in Arizona',
    sentences: [
      'Meteor Crater, a great crater approximately 40 miles east of Flagstaff, Arizona, is generally thought by scientists to have formed as a result of the impact of a 60,000-ton meteor about 50,000 years ago.',
      'The meteor, made of nickel and iron, disintegrated on impact and spread half a billion tons of rock over the surface of the land.',
      'The massiveness of the crater can only be appreciated from the air, where it is seen as a giant hole measuring more than 4,000 feet across and 570 feet deep.'
    ],
    highlightIndices: [1],
    question: 'Where in the passage does the author mention the composition of the meteor?',
    options: [
      '(A) Sentence 1',
      '(B) Sentence 2',
      '(C) Sentence 3',
      '(D) Nowhere in the passage'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — Kalimat 1 membahas lokasi, berat, dan waktu jatuhnya meteor.',
      '(B) Benar — Kalimat 2 menyebutkan komposisinya: "made of nickel and iron".',
      '(C) Salah — Kalimat 3 membahas ukuran diameter dan kedalaman kawah.',
      '(D) Salah — Disebutkan di Kalimat 2.'
    ]
  },
  {
    num: 13, group: 'E', page: 'p. 435', title: 'Determine the tone, purpose, or course',
    indonesianTitle: 'Tentukan Nada Penulis (Tone), Tujuan (Purpose), atau Mata Kuliah (Course)',
    explanation: 'Pertanyaan keseluruhan bacaan ini menguji: (1) Tone (apakah penulis bersifat informatif/netral, kritis, atau antusias?), (2) Purpose (tujuan utama penulisan teks), dan (3) Course (mata kuliah universitas apa yang menggunakan bacaan ini?).',
    whereToFind: 'Ide pokok seluruh bacaan dan pilihan diksi emosional/objektif penulis.',
    strategy: 'Sebagian besar bacaan TOEFL bersifat objektif/informatif (kecuali jika ada banyak kata sifat emosional). Untuk "Course", cocokkan topik utama dengan nama mata kuliah umum (Biology, History, Astronomy, Literature, Psychology).',
    passageTitle: 'Truman Capote\'s In Cold Blood',
    sentences: [
      'Truman Capote\'s In Cold Blood (1966) is a well-known example of the "nonfiction novel," a popular type of writing based upon factual events in which the author attempts to describe the underlying forces, thoughts, and emotions that lead to actual events.'
    ],
    highlightIndices: [0],
    question: 'In which course would this reading most likely be assigned?',
    options: [
      '(A) American Literature',
      '(B) Organic Chemistry',
      '(C) Civil Engineering',
      '(D) Macroeconomics'
    ],
    correct: 0,
    optionAnalysis: [
      '(A) Benar — Membahas karya sastra penulis Amerika Truman Capote dan genre novel nonfiksi.',
      '(B) Salah — Tidak relevan.',
      '(C) Salah — Tidak relevan.',
      '(D) Salah — Tidak relevan.'
    ]
  },
  {
    num: 14, group: 'E', page: 'p. 441', title: 'Determine where to insert a piece of information',
    indonesianTitle: 'Tentukan Posisi Penyisipan Kalimat Baru [■] (Format CBT)',
    explanation: 'Pada format Computer-Based TOEFL (CBT), Anda diberi satu kalimat baru dan diminta mengklik kotak hitam [■] di antara kalimat-kalimat bacaan tempat kalimat tersebut paling tepat disisipkan.',
    whereToFind: 'Perhatikan kata hubung (however, therefore, for example) dan kata ganti rujukan (this, these, they, such) pada kalimat yang akan disisipkan.',
    strategy: 'Baca kalimat baru → Cari kata petunjuk transisi atau pronoun → Cocokkan dengan kalimat sebelum dan sesudah setiap posisi [■] agar alur ide mengalir mulus.',
    insertionTask: {
      sentenceToInsert: 'For example, when a seed is planted in the ground, its roots always grow downward while its stem grows upward toward the light.',
      slots: [
        { id: 1, label: '[■ 1]' },
        { id: 2, label: '[■ 2]' },
        { id: 3, label: '[■ 3]' },
        { id: 4, label: '[■ 4]' }
      ],
      correctSlot: 2,
      segments: [
        'Plants respond to gravity through a biological process known as gravitropism.',
        'This directional growth ensures that roots anchor the plant and absorb water while leaves capture sunlight for photosynthesis.',
        'Specialized starch-filled cells in the root cap detect the pull of gravity and redistribute growth hormones accordingly.'
      ]
    },
    passageTitle: 'Gravitropism in Plants',
    sentences: [
      'Plants respond to gravity through a biological process known as gravitropism.',
      'This directional growth ensures that roots anchor the plant and absorb water while leaves capture sunlight for photosynthesis.',
      'Specialized starch-filled cells in the root cap detect the pull of gravity and redistribute growth hormones accordingly.'
    ],
    highlightIndices: [0, 1],
    question: 'Where would the sentence "For example, when a seed is planted in the ground, its roots always grow downward while its stem grows upward toward the light." best fit?',
    options: [
      '(A) Position [■ 1] — Before sentence 1',
      '(B) Position [■ 2] — Between sentence 1 and sentence 2',
      '(C) Position [■ 3] — Between sentence 2 and sentence 3',
      '(D) Position [■ 4] — After sentence 3'
    ],
    correct: 1,
    optionAnalysis: [
      '(A) Salah — "For example" tidak bisa memulai paragraf sebelum definisi umum.',
      '(B) Benar — Memberikan contoh konkret setelah kalimat 1 memperkenalkan konsep gravitropism, dan langsung diikuti kalimat 2 yang merujuk pada "This directional growth" (pertumbuhan akar ke bawah & batang ke atas).',
      '(C) Salah — Kalimat 2 sudah merujuk pada pertumbuhan berarah tersebut.',
      '(D) Salah — Kalimat 3 sudah masuk ke mekanisme seluler mikroskopis.'
    ]
  }
];

// ============================================================================
// 5. WRITING MASTERCLASS DATA (SKILLS 1–8, pp. 473–512)
// ============================================================================

const WRITING_RUBRIC = [
  { score: '6', label: 'Sangat Baik (Exemplary)', desc: 'Menjawab topik secara menyeluruh, terorganisasi rapi dengan pengembangan ide kuat, contoh spesifik, variasi struktur kalimat matang, dan hampir tanpa kesalahan tata bahasa/kosakata.' },
  { score: '5', label: 'Baik Sekali (Strong)', desc: 'Menjawab topik dengan jelas dan terstruktur baik, memiliki contoh pendukung memadai, meskipun terdapat beberapa kesalahan kecil tata bahasa/pilihan kata yang tidak mengganggu makna.' },
  { score: '4', label: 'Memadai (Competent)', desc: 'Menjawab topik dengan cukup jelas dan memiliki paragraf dasar, tetapi pengembangan ide kurang mendalam dan terdapat kesalahan tata bahasa atau penggunaan kata yang cukup terlihat.' },
  { score: '3', label: 'Berkembang (Developing)', desc: 'Menunjukkan kelemahan dalam organisasi atau pengembangan ide, contoh kurang relevan, serta kesalahan struktur kalimat berulang yang kadang mengaburkan makna.' },
  { score: '2', label: 'Terbatas (Flawed)', desc: 'Organisasi sangat lemah, ide tidak berkembang, banyak kesalahan tata bahasa dasar dan kosakata yang menyulitkan pembaca memahami maksud esai.' },
  { score: '1', label: 'Sangat Lemah (Incompetent)', desc: 'Tidak menjawab topik, sangat singkat atau tidak koheren, dan dipenuhi kesalahan bahasa mendasar.' }
];

const WRITING_SKILLS = [
  {
    num: 1, stage: 'Before Writing', page: 'p. 481', title: 'Decode the Topic',
    indonesianTitle: 'Bedah Soal Esai (Decode the Topic)',
    explanation: 'Baca perintah soal (prompt) dengan cermat untuk mengidentifikasi tugas utama: apakah Anda diminta memilih satu sisi pendapat (Agree/Disagree), membandingkan dua pilihan (Compare & Contrast), atau menjelaskan sebab-akibat/karakteristik.',
    examplePrompt: 'Do you agree or disagree with the following statement? Always telling the truth is the most important consideration in any relationship. Use specific reasons and examples to support your answer.',
    tips: [
      'Identifikasi kata kunci topik ("always telling the truth", "any relationship").',
      'Tentukan posisi Anda secara tegas di awal (jangan ragu-ragu di tengah jalan).',
      'Pastikan seluruh alasan menjawab langsung pertanyaan prompt.'
    ]
  },
  {
    num: 2, stage: 'Before Writing', page: 'p. 484', title: 'Develop Supporting Ideas',
    indonesianTitle: 'Kembangkan Ide Pendukung & Contoh Spesifik',
    explanation: 'Luangkan 3–5 menit pertama untuk membuat kerangka (outline) berisi 2 hingga 3 alasan utama, masing-masing dilengkapi detail spesifik atau contoh nyata/hipotetis.',
    examplePrompt: 'Outline: Thesis (Disagree: white lies sometimes protect feelings) → Reason 1: Protecting loved ones from unnecessary pain + Example → Reason 2: Maintaining social harmony in professional settings + Example.',
    tips: [
      'Gunakan 2–3 alasan berbeda agar paragraf isi tidak saling mengulang.',
      'Setiap alasan wajib punya contoh spesifik (bukan sekadar pernyataan umum).'
    ]
  },
  {
    num: 3, stage: 'While Writing', page: 'p. 487', title: 'Write the Introductory Paragraph',
    indonesianTitle: 'Tulis Paragraf Pembuka (Hook + Background + Thesis Statement)',
    explanation: 'Paragraf pembuka yang efektif terdiri dari: (1) Kalimat pengantar umum untuk menarik minat pembaca, (2) Penyempitan konteks topik, dan (3) Thesis Statement yang menyatakan posisi serta peta alasan Anda.',
    examplePrompt: 'Honesty is universally praised as a cornerstone of human interaction. However, absolute honesty in every situation can sometimes cause needless harm. In my view, while honesty is vital, tact and kindness are equally important in maintaining healthy relationships.',
    tips: [
      'Jangan menyalin kata-kata soal secara mentah-mentah; lakukan parafrase.',
      'Akhiri paragraf pembuka dengan Thesis Statement yang jelas.'
    ]
  },
  {
    num: 4, stage: 'While Writing', page: 'p. 490', title: 'Write Unified Supporting Paragraphs',
    indonesianTitle: 'Tulis Paragraf Pendukung yang Padu (Topic Sentence + Details)',
    explanation: 'Setiap paragraf isi harus membahas SATU gagasan utama yang dinyatakan pada Topic Sentence (kalimat pertama paragraf), lalu didukung oleh penjelasan dan contoh spesifik.',
    examplePrompt: 'First, refraining from blunt truth can protect close friends and family from unnecessary emotional distress. For instance, if a friend asks about an outfit right before an important interview, offering encouraging feedback builds confidence rather than causing last-minute anxiety.',
    tips: [
      'Pastikan semua kalimat di dalam satu paragraf mendukung Topic Sentence paragraf tersebut (Unity).',
      'Gunakan contoh konkret ("For example", "For instance", "To illustrate").'
    ]
  },
  {
    num: 5, stage: 'While Writing', page: 'p. 493', title: 'Write the Concluding Paragraph',
    indonesianTitle: 'Tulis Paragraf Penutup (Restate Thesis + Summarize + Final Thought)',
    explanation: 'Paragraf penutup merangkum kembali poin-poin utama dan menyatakan ulang Thesis Statement dengan struktur kalimat baru, tanpa memperkenalkan argumen yang sama sekali baru.',
    examplePrompt: 'In conclusion, although truthfulness forms the foundation of trust, compassionate discretion is sometimes necessary to preserve emotional well-being and social harmony. Balancing honesty with empathy ultimately strengthens human relationships.',
    tips: [
      'Mulai dengan penanda penutup seperti "In conclusion," atau "To summarize,".',
      'Jangan membawa ide/argumen baru yang belum dibahas di paragraf isi.'
    ]
  },
  {
    num: 6, stage: 'While Writing', page: 'p. 496', title: 'Connect the Supporting Paragraphs',
    indonesianTitle: 'Hubungkan Paragraf Pendukung dengan Transisi yang Halus (Coherence)',
    explanation: 'Gunakan kata/frasa transisi (First of all, Furthermore, In addition, On the other hand, Consequently) serta pengulangan kata kunci yang bervariasi untuk menciptakan alur bacaan yang koheren.',
    examplePrompt: 'Paragraf Isi 1: "First and foremost, ..." → Paragraf Isi 2: "In addition to protecting personal feelings, ..." → Penutup: "In summary, ..."',
    tips: [
      'Gunakan variasi penanda urutan (First, Second, Finally) dan penanda penambahan (Moreover, Furthermore).',
      'Kaitkan ide akhir paragraf sebelumnya dengan kalimat pembuka paragraf berikutnya.'
    ]
  },
  {
    num: 7, stage: 'After Writing', page: 'p. 499', title: 'Edit Sentence Structure (7A: Simple, 7B: Compound, 7C: Complex)',
    indonesianTitle: 'Sunting Struktur Kalimat (7A Kalimat Tunggal, 7B Majemuk Setara, 7C Majemuk Bertingkat)',
    explanation: 'Sisihkan 3–5 menit terakhir untuk menyunting tulisan Anda: pastikan tidak ada kalimat terpotong (sentence fragment), tidak ada comma splice (dua klausa digabung koma tanpa connector seperti and/but/so), dan gunakan variasi kalimat kompleks (because, although, which, that).',
    examplePrompt: 'Salah (Comma Splice): "Many students study late, they want high scores." → Benar (7B): "Many students study late, because they want high scores." / "Many students study late, so they can achieve high scores."',
    tips: [
      '7A: Pastikan setiap kalimat punya Subject & Verb lengkap.',
      '7B: Gunakan koma + coordinate connector (and, but, or, so, yet) untuk menggabungkan 2 klausa setara.',
      '7C: Gunakan adverb, adjective, dan noun clauses untuk memperkaya variasi kalimat.'
    ]
  },
  {
    num: 8, stage: 'After Writing', page: 'p. 505', title: 'Edit Written Expression (8A–8F)',
    indonesianTitle: 'Sunting Tata Bahasa Rinci (8A–8F: Inversion/S-V, Parallel, Verb, Noun, Pronoun, Adj/Adv)',
    explanation: 'Lakukan pemeriksaan tata bahasa akhir mencakup 6 area utama buku Longman: (8A) Inversi & Subject-Verb Agreement, (8B) Parallel Structure, (8C) Bentuk & Tense Kata Kerja, (8D) Kata Benda & Artikel, (8E) Kata Ganti (Pronouns), dan (8F) Adjectives & Adverbs.',
    examplePrompt: 'Checklist 8A–8F: Cek kesesuaian S-V tunggal/jamak, pastikan bentuk setelah "and/or" paralel, cek artikel "a/an/the" pada singular noun, dan pastikan tidak ada salah eja.',
    tips: [
      '8A: Cek S-V agreement pada subjek panjang.',
      '8B: Cek kesejajaran bentuk kata dalam daftar.',
      '8C–8F: Periksa tenses, artikel singular noun, rujukan pronoun, serta perbedaan adjective vs adverb (-ly).'
    ]
  }
];

const WRITING_EDITING_DRILLS = [
  {
    id: 'we-1',
    skillRef: 'Writing Skill 7B (Compound Sentences)',
    faulty: 'Technology has improved communication, it has also reduced face-to-face interaction.',
    issue: 'Comma Splice — Dua klausa lengkap digabungkan hanya dengan tanda koma tanpa coordinate connector.',
    options: [
      'Technology has improved communication, but it has also reduced face-to-face interaction.',
      'Technology has improved communication, it also reduced face-to-face interaction.',
      'Technology improving communication, it has also reduced face-to-face interaction.'
    ],
    correct: 0,
    explanation: 'Menambahkan coordinate connector "but" setelah koma menghubungkan dua klausa kontras secara gramatikal.'
  },
  {
    id: 'we-2',
    skillRef: 'Writing Skill 8B (Parallel Structure)',
    faulty: 'Students can succeed in college by attending classes regularly, taking detailed notes, and to review materials weekly.',
    issue: 'Kesalahan Parallel Structure — "attending" (V-ing) dan "taking" (V-ing) tidak sejajar dengan "to review" (to-infinitive).',
    options: [
      'Students can succeed in college by attending classes regularly, taking detailed notes, and reviewing materials weekly.',
      'Students can succeed in college by attend classes regularly, taking detailed notes, and reviewing materials weekly.',
      'Students can succeed in college by attending classes regularly, take detailed notes, and to review materials weekly.'
    ],
    correct: 0,
    explanation: 'Ketiga frasa setelah preposisi "by" harus berbentuk gerund (-ing): attending, taking, dan reviewing.'
  },
  {
    id: 'we-3',
    skillRef: 'Writing Skill 8A & 8D (S-V Agreement & Articles)',
    faulty: 'Every students in the university need a access to reliable library resources.',
    issue: 'Kesalahan ganda: "Every" diikuti jamak "students" + Verb jamak "need", serta artikel "a" sebelum bunyi vokal "access".',
    options: [
      'Every student in the university needs access to reliable library resources.',
      'Every students in the university needs an access to reliable library resources.',
      'Every student in the university need access to reliable library resources.'
    ],
    correct: 0,
    explanation: '"Every" diikuti singular noun "student" + singular verb "needs", dan "access" (uncountable) tidak memerlukan "a".'
  }
];

// ============================================================================
// 6. APPENDIX A–I DATA (pp. 565–600) & DIAGNOSTIC SETS
// ============================================================================

const APPENDIX_DATA = [
  {
    id: 'A',
    title: 'Appendix A: Similar Sounds',
    pages: 'pp. 565–566',
    desc: 'Daftar pasangan kata dengan bunyi mirip (minimal pairs & homofon) yang sering dipakai sebagai jebakan pada Listening Skill 3.',
    items: [
      { term: 'apartment / appointment', meaning: 'apartemen vs janji temu', example: 'He searched for a new apartment (bukan appointment).' },
      { term: 'cart / card / guard', meaning: 'kereta dorong / kartu / penjaga', example: 'Put the groceries in the shopping cart.' },
      { term: 'cheat / sheet / seat', meaning: 'menyontek / lembaran / tempat duduk', example: 'Please take a seat in the front row.' },
      { term: 'class / glass / grass', meaning: 'kelas / gelas-kaca / rumput', example: 'The biology class starts at nine.' },
      { term: 'cough / coffee / copy', meaning: 'batuk / kopi / salinan', example: 'Make a copy of the syllabus.' },
      { term: 'dessert / desert', meaning: 'makanan penutup / gurun pasir', example: 'We ordered chocolate cake for dessert.' },
      { term: 'lake / late / let', meaning: 'danau / terlambat / membiarkan', example: 'Don\'t be late for the seminar.' },
      { term: 'price / prize / pride', meaning: 'harga / hadiah / kebanggaan', example: 'She won first prize in the essay contest.' }
    ],
    quiz: {
      question: 'Dalam Listening Skill 3, jika pembicara berkata "He was looking for a new apartment", manakah jebakan bunyi mirip yang paling sering muncul?',
      options: ['He had an appointment.', 'He lived in a house.', 'He bought furniture.', 'He moved yesterday.'],
      correct: 0,
      explanation: '"appointment" memiliki bunyi yang sangat mirip dengan "apartment".'
    }
  },
  {
    id: 'B',
    title: 'Appendix B: Two- and Three-Part Verbs',
    pages: 'pp. 566–570',
    desc: 'Phrasal verbs (kata kerja + partikel/preposisi) dengan makna idiomatik yang wajib dikuasai untuk Listening Skill 16.',
    items: [
      { term: 'call off', meaning: 'membatalkan (cancel)', example: 'The outdoor concert was called off due to rain.' },
      { term: 'put off', meaning: 'menunda (postpone / delay)', example: 'Never put off until tomorrow what you can do today.' },
      { term: 'turn down', meaning: 'menolak (refuse) / mengecilkan volume', example: 'She turned down the job offer in Chicago.' },
      { term: 'look into', meaning: 'menyelidiki / memeriksa (investigate)', example: 'The committee will look into the budget discrepancy.' },
      { term: 'run out of', meaning: 'kehabisan (exhaust the supply of)', example: 'The lab ran out of chemical reagents.' },
      { term: 'cut down on', meaning: 'mengurangi (reduce)', example: 'Doctors advised him to cut down on caffeine.' },
      { term: 'get along with', meaning: 'akur / berhubungan baik dengan', example: 'All the roommates get along with each other.' },
      { term: 'come up with', meaning: 'menemukan ide / solusi', example: 'The team came up with an innovative design.' }
    ],
    quiz: {
      question: 'Apa makna dari three-part verb "cut down on" dalam kalimat "You should cut down on sugar"?',
      options: ['Mengurangi konsumsi', 'Menambahkan jumlah', 'Membeli lebih banyak', 'Membuang seluruhnya'],
      correct: 0,
      explanation: '"cut down on" berarti mengurangi (reduce).'
    }
  },
  {
    id: 'C',
    title: 'Appendix C: Idioms',
    pages: 'pp. 570–574',
    desc: 'Ungkapan idiomatik umum yang sering muncul dalam percakapan TOEFL (Listening Skill 17).',
    items: [
      { term: 'burn the candle at both ends', meaning: 'bekerja terlalu keras dari pagi hingga larut malam', example: 'Working full-time while taking six classes is burning the candle at both ends.' },
      { term: 'a piece of cake', meaning: 'sangat mudah (very easy)', example: 'For someone who studied all semester, the quiz was a piece of cake.' },
      { term: 'once in a blue moon', meaning: 'sangat jarang terjadi (rarely)', example: 'It snows in this coastal city only once in a blue moon.' },
      { term: 'under the weather', meaning: 'merasa kurang sehat / agak sakit', example: 'Mark stayed home because he was feeling under the weather.' },
      { term: 'hit the nail on the head', meaning: 'tepat sasaran / benar sekali', example: 'Your analysis of the problem hit the nail on the head.' },
      { term: 'on the tip of my tongue', meaning: 'hampir teringat tetapi belum terucap', example: 'I know the author\'s name; it\'s right on the tip of my tongue!' },
      { term: 'see eye to eye', meaning: 'sependapat / sepakat', example: 'The two researchers rarely see eye to eye on methodology.' },
      { term: 'in hot water', meaning: 'dalam masalah besar (in trouble)', example: 'He landed in hot water for missing the deadline.' }
    ],
    quiz: {
      question: 'Jika seseorang berkata "I\'m feeling a bit under the weather today", apa maksudnya?',
      options: ['Dia merasa kurang sehat.', 'Dia sedang berdiri di bawah hujan.', 'Dia meramalkan cuaca buruk.', 'Dia merasa sangat bersemangat.'],
      correct: 0,
      explanation: '"under the weather" adalah idiom yang berarti merasa tidak enak badan / sakit ringan.'
    }
  },
  {
    id: 'D',
    title: 'Appendix D: Prepositions',
    pages: 'pp. 574–576',
    desc: 'Kombinasi preposisi baku bersama kata sifat, kata kerja, dan kata benda untuk Structure Skills 56–57.',
    items: [
      { term: 'according to', meaning: 'menurut / berdasarkan', example: 'According to the professor, the exam covers Chapters 1–5.' },
      { term: 'depend on / rely on', meaning: 'bergantung pada / mengandalkan', example: 'The experiment\'s success depends on precise temperature control.' },
      { term: 'interested in', meaning: 'tertarik pada', example: 'Many students are interested in marine biology.' },
      { term: 'responsible for', meaning: 'bertanggung jawab atas', example: 'Each lab partner is responsible for recording data.' },
      { term: 'consist of', meaning: 'terdiri dari (tidak pernah bentuk pasif!)', example: 'Water consists of hydrogen and oxygen.' },
      { term: 'participate in', meaning: 'berpartisipasi dalam', example: 'Over two hundred students participated in the symposium.' },
      { term: 'different from', meaning: 'berbeda dari', example: 'This species is genetically different from its mainland relatives.' },
      { term: 'in spite of / despite', meaning: 'meskipun (+ Noun Phrase)', example: 'In spite of the heavy rain, the outdoor ceremony continued.' }
    ],
    quiz: {
      question: 'Manakah penggunaan preposisi yang tepat menurut Appendix D?',
      options: ['consist of', 'consist from', 'according with', 'depend of'],
      correct: 0,
      explanation: '"consist of" (terdiri dari) adalah pasangan preposisi baku.'
    }
  },
  {
    id: 'E',
    title: 'Appendix E: Word Endings',
    pages: 'pp. 576–582',
    desc: 'Akhiran kata (suffixes) penanda kelas kata Noun, Verb, Adjective, dan Adverb untuk Structure Skills 46–51.',
    items: [
      { term: '-tion / -sion / -ment / -ness / -ity', meaning: 'Penanda NOUN (Kata Benda)', example: 'education, decision, development, happiness, ability' },
      { term: '-er / -or / -ist / -ian / -ent', meaning: 'Penanda NOUN Orang (Person)', example: 'researcher, director, biologist, historian, student' },
      { term: '-ize / -ate / -ify / -en', meaning: 'Penanda VERB (Kata Kerja)', example: 'analyze, activate, simplify, strengthen' },
      { term: '-ful / -less / -ous / -al / -ive / -able', meaning: 'Penanda ADJECTIVE (Kata Sifat)', example: 'careful, endless, dangerous, natural, active, reliable' },
      { term: '-ly (pada umumnya)', meaning: 'Penanda ADVERB (Kata Keterangan)', example: 'rapidly, carefully, scientifically, significantly' }
    ],
    quiz: {
      question: 'Akhiran manakah yang secara khas menandai kata benda orang (person noun)?',
      options: ['-ist / -or', '-ous / -ful', '-ify / -ize', '-ly'],
      correct: 0,
      explanation: 'Akhiran -ist (chemist, biologist) dan -or (actor, director) menandai pelaku/orang.'
    }
  },
  {
    id: 'F',
    title: 'Appendix F: Irregular Verb Forms',
    pages: 'pp. 582–584',
    desc: 'Daftar kata kerja tidak beraturan (V1 – V2 – V3) yang sering diujikan pada Structure Skills 30–32 dan 37.',
    items: [
      { term: 'arise – arose – arisen', meaning: 'muncul / timbul', example: 'Several complications have arisen during testing.' },
      { term: 'begin – began – begun', meaning: 'memulai', example: 'The lecture had already begun when we arrived.' },
      { term: 'choose – chose – chosen', meaning: 'memilih', example: 'The committee has chosen a new chairperson.' },
      { term: 'drink – drank – drunk', meaning: 'minum', example: 'He had drunk two glasses of water.' },
      { term: 'freeze – froze – frozen', meaning: 'membeku', example: 'The lake was completely frozen by January.' },
      { term: 'ring – rang – rung', meaning: 'berdering', example: 'The bell has rung three times.' },
      { term: 'shrink – shrank – shrunk', meaning: 'menyusut', example: 'The glacier has shrunk significantly over fifty years.' },
      { term: 'write – wrote – written', meaning: 'menulis', example: 'The manuscript was written in the fifteenth century.' }
    ],
    quiz: {
      question: 'Bentuk Past Participle (V3) yang tepat untuk kata kerja "shrink" setelah "has/have" adalah...',
      options: ['shrunk', 'shrank', 'shrinked', 'shrinking'],
      correct: 0,
      explanation: 'Konjugasi baku: shrink (V1) – shrank (V2) – shrunk (V3).'
    }
  },
  {
    id: 'G',
    title: 'Appendix G: Formation of the Passive',
    pages: 'pp. 584–586',
    desc: 'Tabel lengkap pembentukan kalimat pasif (be + V3) di seluruh tenses untuk Structure Skills 37–38.',
    items: [
      { term: 'Simple Present Passive', meaning: 'am / is / are + V3', example: 'New data are collected every week.' },
      { term: 'Simple Past Passive', meaning: 'was / were + V3', example: 'The theory was proposed in 1905.' },
      { term: 'Present Continuous Passive', meaning: 'am / is / are + being + V3', example: 'A new laboratory is being constructed.' },
      { term: 'Present Perfect Passive', meaning: 'have / has + been + V3', example: 'Many species have been discovered in the rainforest.' },
      { term: 'Past Perfect Passive', meaning: 'had + been + V3', example: 'The samples had been analyzed before the report was published.' },
      { term: 'Modal Passive', meaning: 'modal (can/will/must/should) + be + V3', example: 'Safety goggles must be worn in the laboratory.' }
    ],
    quiz: {
      question: 'Manakah rumus Present Perfect Passive yang benar?',
      options: ['have/has + been + V3', 'have/has + being + V3', 'was/were + been + V3', 'have/has + V2'],
      correct: 0,
      explanation: 'Present Perfect Passive dibentuk dengan have/has + been + Past Participle (V3).'
    }
  },
  {
    id: 'H',
    title: 'Appendix H: Irregular Plurals',
    pages: 'pp. 586–587',
    desc: 'Kata benda jamak tidak beraturan (asal bahasa Inggris kuno, Latin, Yunani) untuk Structure Skill 41.',
    items: [
      { term: 'criterion → criteria', meaning: 'kriteria (tunggal → jamak)', example: 'Strict criteria were applied during selection.' },
      { term: 'phenomenon → phenomena', meaning: 'fenomena (tunggal → jamak)', example: 'Atmospheric phenomena are studied by meteorologists.' },
      { term: 'bacterium → bacteria', meaning: 'bakteri (tunggal → jamak)', example: 'Beneficial bacteria live in the human digestive tract.' },
      { term: 'datum → data', meaning: 'data (tunggal → jamak dalam TOEFL formal)', example: 'These experimental data support our hypothesis.' },
      { term: 'analysis → analyses', meaning: 'analisis (tunggal → jamak)', example: 'Chemical analyses were performed on all samples.' },
      { term: 'nucleus → nuclei', meaning: 'inti sel/atom (tunggal → jamak)', example: 'Atomic nuclei contain protons and neutrons.' },
      { term: 'alumnus → alumni', meaning: 'alumni (tunggal → jamak)', example: 'Thousands of alumni attended the homecoming event.' },
      { term: 'foot / tooth / mouse → feet / teeth / mice', meaning: 'kaki / gigi / tikus', example: 'White mice are commonly used in behavioral studies.' }
    ],
    quiz: {
      question: 'Kata manakah yang merupakan bentuk JAMAK (plural)?',
      options: ['criteria', 'criterion', 'phenomenon', 'nucleus'],
      correct: 0,
      explanation: '"criteria" adalah bentuk jamak dari "criterion".'
    }
  },
  {
    id: 'I',
    title: 'Appendix I: Word Parts (Prefixes & Roots)',
    pages: 'pp. 587–600',
    desc: 'Awalan (prefixes) dan akar kata (roots) Latin/Yunani untuk menebak kosakata Reading Skill 9.',
    items: [
      { term: 'ante- / pre- (before)', meaning: 'sebelum', example: 'antedate, prehistoric, predict' },
      { term: 'anti- / contra- (against)', meaning: 'melawan / bertentangan', example: 'antibiotic, contradict, contrast' },
      { term: 'auto- (self)', meaning: 'diri sendiri / otomatis', example: 'autobiography, autonomous' },
      { term: 'bio- (life)', meaning: 'kehidupan', example: 'biology, biosphere, biodegradable' },
      { term: 'chron- (time)', meaning: 'waktu', example: 'chronological, synchronize, chronic' },
      { term: 'geo- / terr- (earth / land)', meaning: 'bumi / tanah', example: 'geology, subterranean, terrestrial' },
      { term: 'micro- / macro- (small / large)', meaning: 'kecil / besar', example: 'microscopic, macroeconomics' },
      { term: 'sub- / trans- (under / across)', meaning: 'di bawah / melintasi', example: 'subterranean, transatlantic, transmit' }
    ],
    quiz: {
      question: 'Berdasarkan Appendix I, apa arti akar kata "chron-" dalam kata "chronological"?',
      options: ['Waktu (time)', 'Bumi (earth)', 'Kehidupan (life)', 'Air (water)'],
      correct: 0,
      explanation: 'Akar kata Yunani "chron-" berarti waktu (time).'
    }
  }
];

// Diagnostic Pre-Test, Post-Test, and Complete Test Item Bank (Mapped to Exact Longman Skills)
const DIAGNOSTIC_QUESTIONS = [
  {
    id: 'diag-L1',
    section: 'Listening',
    skillRef: 'Listening Skill 1 & 2',
    prompt: '[Transkrip Simulasi] Man: "The exam was really difficult, wasn\'t it?" | Woman: "It couldn\'t have been much harder!" | Question: What does the woman mean?',
    options: [
      '(A) The exam was very easy.',
      '(B) The exam was extremely difficult.',
      '(C) She didn\'t take the exam.',
      '(D) She thought the exam was too short.'
    ],
    correct: 1,
    category: 'Listening Comprehension Error',
    explanation: '"It couldn\'t have been much harder" adalah ungkapan penekanan bahwa ujian tersebut sudah berada di tingkat kesulitan maksimal (sangat sulit).'
  },
  {
    id: 'diag-L2',
    section: 'Listening',
    skillRef: 'Listening Skill 7 & 10',
    prompt: '[Transkrip Simulasi] Woman: "Did you enjoy the symphony concert last night?" | Man: "Never have I heard a more inspiring performance." | Question: What does the man say about the concert?',
    options: [
      '(A) He has never attended a symphony concert.',
      '(B) The performance was the most inspiring he has ever heard.',
      '(C) He did not find the concert inspiring.',
      '(D) He left before the performance ended.'
    ],
    correct: 1,
    category: 'Listening Comprehension Error',
    explanation: 'Kombinasi negatif ("Never") + komparatif ("more inspiring") menghasilkan makna superlatif: pertunjukan paling menginspirasi yang pernah didengarnya.'
  },
  {
    id: 'diag-S1',
    section: 'Structure',
    skillRef: 'Structure Skill 2 & 20',
    prompt: 'The major cause of the tides _______ the gravitational pull of the Moon.',
    options: [
      '(A) are',
      '(B) is',
      '(C) being',
      '(D) were'
    ],
    correct: 1,
    category: 'Grammar Error',
    explanation: 'Subject utama adalah "The major cause" (tunggal), sedangkan "of the tides" hanyalah Prepositional Phrase. Maka Verb yang dibutuhkan adalah tunggal: "is".'
  },
  {
    id: 'diag-S2',
    section: 'Structure',
    skillRef: 'Structure Skill 14',
    prompt: 'The NASA spacecraft _______ toward Mars last month is expected to send back high-resolution photographs.',
    options: [
      '(A) launched',
      '(B) was launched',
      '(C) launching',
      '(D) it launched'
    ],
    correct: 0,
    category: 'Grammar Error',
    explanation: 'Kalimat sudah memiliki Verb utama "is expected". Frasa di tengah adalah Reduced Adjective Clause pasif ("[which was] launched toward Mars").'
  },
  {
    id: 'diag-S3',
    section: 'Structure',
    skillRef: 'Structure Skill 17',
    prompt: 'Seldom _______ such a dramatic shift in global atmospheric circulation patterns.',
    options: [
      '(A) meteorologists have observed',
      '(B) have meteorologists observed',
      '(C) meteorologists observing',
      '(D) observed meteorologists'
    ],
    correct: 1,
    category: 'Grammar Error',
    explanation: 'Kata hampir negatif "Seldom" di awal kalimat memicu inversi Subject dan Verb: Seldom + auxiliary ("have") + Subject ("meteorologists") + V3 ("observed").'
  },
  {
    id: 'diag-S4',
    section: 'Structure',
    skillRef: 'Structure Skill 25 & 40',
    prompt: '[Written Expression] Neither the professor (A) nor his research assistants (B) was able to find (C) the missing equipments (D).',
    options: [
      '(A) Neither the professor',
      '(B) nor his research assistants',
      '(C) was able to find',
      '(D) equipments'
    ],
    correct: 3,
    category: 'Grammar Error',
    explanation: '"equipment" adalah uncountable noun (Skill 40) sehingga tidak pernah memiliki bentuk jamak "-s" ("equipment").'
  },
  {
    id: 'diag-R1',
    section: 'Reading',
    skillRef: 'Reading Skill 1 & 3',
    prompt: '[Kutipan Teks] "Unlike terrestrial planets such as Earth and Mars, which have solid rocky surfaces, the Jovian planets—Jupiter, Saturn, Uranus, and Neptune—are composed primarily of hydrogen and helium gases." | Question: According to the passage, how do Jovian planets differ from terrestrial planets?',
    options: [
      '(A) Jovian planets have solid rocky surfaces.',
      '(B) Jovian planets are composed mostly of gases rather than solid rock.',
      '(C) Terrestrial planets are larger than Jupiter.',
      '(D) Jovian planets contain no hydrogen.'
    ],
    correct: 1,
    category: 'Reading Comprehension Error',
    explanation: 'Teks menyatakan bahwa planet terestrial memiliki permukaan berbatu padat ("solid rocky surfaces"), sedangkan planet Jovian tersusun terutama dari gas hidrogen dan helium.'
  },
  {
    id: 'diag-R2',
    section: 'Reading',
    skillRef: 'Reading Skill 8 & 9',
    prompt: '[Kutipan Teks] "The ancient aqueducts—artificial channels constructed to convey water over long distances—demonstrate the advanced hydraulic engineering of Roman civilization." | Question: The word "aqueducts" in the passage means _______',
    options: [
      '(A) defensive stone walls',
      '(B) man-made channels built to transport water',
      '(C) underground burial chambers',
      '(D) public marketplaces'
    ],
    correct: 1,
    category: 'Vocabulary Error',
    explanation: 'Structural clue (tanda pisah —) memberikan definisi langsung: "artificial channels constructed to convey water over long distances".'
  }
];

// ============================================================================
// 7. GEMINI AI TUTOR SERVICE WITH EXPONENTIAL BACKOFF
// ============================================================================

async function callGeminiTutor(userPrompt, contextSummary = '') {
  const apiKey = '';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const systemPrompt = `Anda adalah "TOEFL Study Assistant", tutor virtual ahli untuk buku klasik Deborah Phillips (2001), "Longman Complete Course for the TOEFL Test: Preparation for the Computer and Paper Tests" (687 halaman).
Aturan Wajib:
1. Gunakan Bahasa Indonesia yang ramah, jelas, sistematis, dan edukatif untuk semua penjelasan, definisi, dan strategi.
2. Pertahankan semua contoh kalimat bahasa Inggris, istilah inti grammar Inggris (Subject, Verb, Noun Clause, Adjective Clause, Reduced Clause, Inversion, Appositive, Participle, dsb.), dan soal dalam bahasa Inggris asli disertai terjemahan/penjelasan Bahasa Indonesia.
3. Selalu rujuk nomor Skill Longman yang relevan (Listening Skills 1–34, Structure Skills 1–60, Reading Skills 1–14, Writing Skills 1–8, Appendix A–I).
4. Ingatkan bila relevan bahwa kurikulum buku ini menggunakan format historis TOEFL 2001 (PBT skala 217–677 & CBT skala 0–300), bukan TOEFL iBT modern.
5. Konteks progres pengguna saat ini: ${contextSummary}`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    }
  };

  const delays = [1000, 2000, 4000];
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        if (attempt < delays.length) {
          await new Promise((res) => setTimeout(res, delays[attempt]));
          continue;
        }
        throw new Error('API request failed');
      }
      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
      throw new Error('Empty response');
    } catch (_err) {
      if (attempt < delays.length) {
        await new Promise((res) => setTimeout(res, delays[attempt]));
        continue;
      }
      // Fallback edukatif berbasis kurikulum Longman jika jaringan/API tidak tersedia
      return generateOfflineTutorFallback(userPrompt);
    }
  }
  return generateOfflineTutorFallback(userPrompt);
}

function generateOfflineTutorFallback(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('jadwal') || lower.includes('plan')) {
    return `**[Rekomendasi Jadwal Belajar — Kurikulum Longman 2001]**\n\n1. **Minggu 1 (Fondasi & Structure Inti):** Pelajari *TOEFL Fundamentals* (pp. xi–xx), kerjakan *Diagnostic Pre-Test*, lalu kuasai **Structure Skills 1–19** (One Clause, Multiple Clauses, Reduced Clauses, dan Inversion).\n2. **Minggu 2 (Structure Lanjutan & Listening):** Lanjutkan **Structure Skills 20–60** (S-V Agreement, Parallel Structure, Verb Forms, Passives, Nouns, Pronouns, Adj/Adv, Articles, Prepositions) serta **Listening Skills 1–17** (Short Dialogues).\n3. **Minggu 3 (Listening Akademik & Reading):** Kuasai **Listening Skills 18–34** (Long Conversations, Long Talks, Academic Discussions & Lectures) dan **Reading Skills 1–14**.\n4. **Minggu 4 (Writing, Appendix & Simulasi):** Latih **Writing Skills 1–8** (esai 30 menit), hafalkan **Appendix A–I** lewat Flashcard Lab, bedah kesalahan di *My Mistakes*, dan kerjakan *Complete Practice Test*.`;
  }
  if (lower.includes('bedakan') || lower.includes('perbedaan')) {
    return `**[Perbandingan Konsep Grammar Longman]**\n\n• **Present Participle (V-ing) vs. Verb (Structure Skill 4):**\n  - *Verb:* Didahului bentuk **be** → *"The man **is talking** to his friend."* (Dia sedang berbicara).\n  - *Adjective (Participle):* Tanpa **be**, menerangkan Noun → *"The man **talking** to his friend has a beard."* (Pria yang sedang berbicara itu berjenggot; Verb utamanya adalah *has*).\n\n• **Adjective Clause vs. Reduced Adjective Clause (Structure Skills 11–14):**\n  - *Lengkap:* *"The report **which was written** yesterday is accurate."*\n  - *Reduced (Diringkas):* *"The report **written** yesterday is accurate."* (Hapus connector *which* dan *was*).`;
  }
  if (lower.includes('contoh')) {
    return `**[3 Contoh Kalimat Tambahan — Pola Longman Structure]**\n\n1. **Structure Skill 2 (Object of Preposition):**\n   *"**In the middle of the night**, **the alarm** **rang** loudly."*\n   (Terjemahan: Di tengah malam, alarm itu berbunyi nyaring. *In the middle of the night* adalah Prepositional Phrase; Subject-nya adalah *the alarm*).\n\n2. **Structure Skill 17 (Negative Inversion):**\n   *"**Never have** **scientists** **observed** such rapid glacial melting."*\n   (Terjemahan: Belum pernah para ilmuwan mengamati pencairan gletser secepat itu).\n\n3. **Structure Skill 20 (S-V Agreement after Prepositional Phrase):**\n   *"**The results** of the latest clinical trials **are** promising."*\n   (Terjemahan: Hasil dari uji klinis terbaru itu menjanjikan. Subject jamak *The results* memakai Verb jamak *are*).`;
  }
  return `**[Penjelasan Tutor — Longman Complete Course (Deborah Phillips, 2001)]**\n\nHalo! Saya siap membantu Anda membedah materi dari buku *Longman Complete Course for the TOEFL Test* (format historis PBT skala 217–677 & CBT skala 0–300).\n\n**Prinsip Emas Mengerjakan Soal TOEFL Longman:**\n1. **Structure (Skills 1–60):** Selalu temukan **Subject** dan **Verb** utama terlebih dahulu. Abaikan jebakan *Prepositional Phrases* (Skill 2) dan *Appositives* (Skill 3). Jika ada dua klausa, pastikan ada tepat satu *Connector* (Skills 6–12).\n2. **Listening (Skills 1–34):** Pada *Short Dialogues*, fokus pada **baris terakhir pembicara kedua** (Skill 1) dan cari **sinonim/parafrase** (Skill 2), hindari kata yang bunyinya mirip (Skill 3).\n3. **Reading (Skills 1–14):** Ide pokok (Skill 1) ada di **kalimat pertama tiap paragraf**, sedangkan pertanyaan detail (Skill 3) selalu berurutan dari atas ke bawah teks.\n\nSilakan ketik nomor **Skill** atau tempelkan **kalimat/soal bahasa Inggris** yang ingin kita bahas bersama!`;
}

// ============================================================================
// 8. REUSABLE UI COMPONENTS (SOURCE BADGES, GRAMMAR TOKENS, DIAGRAMS)
// ============================================================================

function SourceBadge({ type = 'book' }) {
  if (type === 'book') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
        <BookOpen className="w-3 h-3" />
        Sumber Asli Buku Longman (2001)
      </span>
    );
  }
  if (type === 'tutor') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Sparkles className="w-3 h-3" />
        Penjelasan Tutor (Bahasa Indonesia)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
      <Layers className="w-3 h-3" />
      Simulasi & Latihan Tambahan Aplikasi
    </span>
  );
}

function GrammarTokenDisplay({ tokens }) {
  const roleStyles = {
    Subject: 'bg-blue-100 text-blue-900 border-blue-300',
    Verb: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    Connector: 'bg-purple-100 text-purple-900 border-purple-300',
    PrepPhrase: 'bg-slate-200 text-slate-800 border-slate-300',
    Clause: 'bg-amber-100 text-amber-900 border-amber-300'
  };
  const roleLabels = {
    Subject: 'Subject (S)',
    Verb: 'Verb (V)',
    Connector: 'Connector',
    PrepPhrase: 'Prep. Phrase',
    Clause: 'Clause / Complement'
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Analisis Kalimat Visual (Color-Coded Grammar Breakdown)
        </span>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {Object.entries(roleLabels).map(([role, label]) => (
            <span key={role} className={`px-2 py-0.5 rounded border font-medium ${roleStyles[role]}`}>
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {tokens.map((tok, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span
              className={`px-3 py-1.5 rounded-lg border text-sm font-semibold shadow-xs ${
                roleStyles[tok.role] || 'bg-white text-slate-800 border-slate-300'
              }`}
            >
              {tok.text}
            </span>
            <span className="text-[10px] font-medium text-slate-500 mt-1">
              {roleLabels[tok.role] || tok.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiscussionOrgVisualizer() {
  const [mode, setMode] = useState('process');
  return (
    <div className="bg-white border border-indigo-100 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Diagram Pola Organisasi Diskusi Akademik (Skills 29–31)
        </h4>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMode('process')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              mode === 'process' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Process / Chronological (Cacao Tree)
          </button>
          <button
            onClick={() => setMode('classification')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              mode === 'classification' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Classification (Rocks & Music Periods)
          </button>
        </div>
      </div>

      {mode === 'process' ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
          {[
            { step: '1. Harvest & Split', desc: 'Buah pohon kakao dipanen dan dibelah untuk mengambil bijinya.' },
            { step: '2. Fermentation', desc: 'Biji difermentasi beberapa hari untuk membentuk cita rasa.' },
            { step: '3. Drying & Roasting', desc: 'Biji dikeringkan lalu dipanggang untuk melepaskan kulit ari.' },
            { step: '4. Grinding Nibs', desc: 'Cacao nibs digiling menjadi pasta cokelat (chocolate liquor).' }
          ].map((item, idx) => (
            <div key={idx} className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 relative">
              <div className="text-xs font-bold text-amber-900">{item.step}</div>
              <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {[
            {
              cat: 'Kategori 1: Igneous / Baroque',
              desc: 'Terbentuk dari magma mendingin (Granite = lambat/kristal besar; Basalt = cepat/butir halus).'
            },
            {
              cat: 'Kategori 2: Sedimentary / Classical',
              desc: 'Terbentuk dari endapan partikel batuan atau fosil berlapis selama jutaan tahun.'
            },
            {
              cat: 'Kategori 3: Metamorphic / Romantic',
              desc: 'Batuan yang berubah struktur akibat tekanan dan suhu tinggi di kerak Bumi.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3">
              <div className="text-xs font-bold text-indigo-900">{item.cat}</div>
              <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 9. MODULE VIEWS
// ============================================================================

// -------------------- MODUL 1: LEARNING DASHBOARD --------------------
function DashboardModule({
  progress,
  mistakes,
  onNavigate,
  onSelectSkill
}) {
  const totalSkills = 34 + 60 + 14 + 8; // 116 skills
  const masteredCount =
    progress.listeningMastered.length +
    progress.structureMastered.length +
    progress.readingMastered.length +
    progress.writingMastered.length;
  const overallPercent = Math.round((masteredCount / totalSkills) * 100);

  // Smart next recommendation prioritizing Foundation & Structure Skills 1-19
  const nextRecommendation = useMemo(() => {
    const unmasteredFoundation = RAW_STRUCTURE_SKILLS.filter(
      (s) => s.num <= 19 && !progress.structureMastered.includes(s.num)
    );
    if (unmasteredFoundation.length > 0) {
      const target = unmasteredFoundation[0];
      return {
        badge: 'Prioritas Fondasi Kalimat (Structure Skills 1–19)',
        title: `Structure Skill ${target.num}: ${target.title}`,
        subtitle: `${target.indonesianTitle} (${target.page})`,
        reason:
          'Deborah Phillips menekankan penguasaan pola klausa tunggal, majemuk, reduced clause, dan inversi (Skills 1–19) sebagai fondasi utama sebelum beralih ke aturan kata rinci.',
        action: () => onSelectSkill('structure', target.num)
      };
    }
    const unmasteredListening = RAW_LISTENING_SKILLS.filter(
      (s) => !progress.listeningMastered.includes(s.num)
    );
    if (unmasteredListening.length > 0) {
      const target = unmasteredListening[0];
      return {
        badge: 'Langkah Berikutnya: Listening Masterclass',
        title: `Listening Skill ${target.num}: ${target.title}`,
        subtitle: `${target.indonesianTitle} (${target.page})`,
        reason:
          'Fondasi Structure 1–19 Anda sudah solid! Lanjutkan memperkuat strategi pemahaman dialog dan kuliah akademik.',
        action: () => onSelectSkill('listening', target.num)
      };
    }
    return {
      badge: 'Siap Evaluasi Menyeluruh',
      title: 'Diagnostic & Complete Practice Test',
      subtitle: 'Uji ketahanan skor PBT (217–677) & CBT (0–300)',
      reason:
        'Anda telah menguasai sebagian besar materi inti. Uji kemampuan lintas-section di Modul 9 atau perkuat kosakata di Appendix Lab.',
      action: () => onNavigate('diagnostic')
    };
  }, [progress, onSelectSkill, onNavigate]);

  const sectionCards = [
    {
      id: 'listening',
      title: 'Section One: Listening',
      pages: 'pp. 3–182',
      skillCount: 34,
      mastered: progress.listeningMastered.length,
      priority: null,
      desc: 'Short Dialogues (Skills 1–17), Long Conversations (18–22), Long Talks (23–27), Casual Conversations (28), Academic Discussions (29–31), & Academic Lectures (32–34).',
      color: 'sky'
    },
    {
      id: 'structure',
      title: 'Section Two: Structure',
      pages: 'pp. 185–340',
      skillCount: 60,
      mastered: progress.structureMastered.length,
      priority: 'Prioritas Fondasi',
      desc: 'Lengkap 60 Skills (Grup A–R): One/Multiple Clauses, Reduced Clauses, Inversion, S-V Agreement, Parallelism, Verb Forms, Passives, Nouns, Pronouns, Adj/Adv, Articles & Usage.',
      color: 'indigo'
    },
    {
      id: 'reading',
      title: 'Section Three: Reading',
      pages: 'pp. 343–470',
      skillCount: 14,
      mastered: progress.readingMastered.length,
      priority: null,
      desc: 'Main Idea & Organization (1–2), Stated/Unstated Details & Pronoun Referents (3–5), Implied & Transition (6–7), Vocabulary Clues & Word Parts (8–11), Overall Review & Insertion [■] (12–14).',
      color: 'emerald'
    },
    {
      id: 'writing',
      title: 'Section Four: Writing',
      pages: 'pp. 473–512',
      skillCount: 8,
      mastered: progress.writingMastered.length,
      priority: null,
      desc: 'Rubrik Skor 1–6 (TWE & CBT), Before Writing (Skills 1–2), While Writing (Skills 3–6), After Writing Sentence & Written Expression Editing (Skills 7–8) + Essay Studio.',
      color: 'amber'
    }
  ];

  const quickModules = [
    { id: 'fundamentals', label: 'Modul 2: TOEFL Fundamentals', sub: 'Format PBT vs CBT & Konversi Skor (pp. xi–xx)', icon: Compass },
    { id: 'appendix', label: 'Modul 7: Appendix A–I Lab', sub: 'Flashcards Idioms, Phrasal Verbs & Word Parts', icon: BookMarked },
    { id: 'practice', label: 'Modul 8: TOEFL Practice Center', sub: '5 Mode Latihan (Timed, Mixed, Challenge)', icon: Target },
    { id: 'diagnostic', label: 'Modul 9: Diagnostic & Evaluation', sub: 'Pre-Test, Post-Test & Grafik Kemampuan', icon: TrendingUp },
    { id: 'mistakes', label: 'Modul 10: My Mistakes Analyzer', sub: `${mistakes.length} Kesalahan Tercatat (Bedah 7 Poin)`, icon: ShieldAlert },
    { id: 'studyplan', label: 'Modul 11: Personal Study Plan', sub: 'Peta Jalan 4 Tahap Belajar Terstruktur', icon: Calendar },
    { id: 'tutor', label: 'Modul 12: TOEFL Study Assistant', sub: 'Tanya Tutor AI (Penjelasan Bahasa Indonesia)', icon: MessageSquare },
    { id: 'checklist', label: 'Audit Kelengkapan Buku (100%)', sub: 'Checklist Seluruh 116 Skills & 9 Appendix', icon: ListChecks }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-lg border border-indigo-800/40">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
            Kurikulum Lengkap Deborah Phillips (2001 • 687 Halaman)
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30">
            Format Historis: PBT (217–677) & CBT (0–300)
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          TOEFL Learning Companion — Longman Complete Course
        </h1>
        <p className="text-slate-300 text-sm md:text-base mt-2 max-w-3xl leading-relaxed">
          Pendamping belajar interaktif berbahasa Indonesia untuk menguasai seluruh 116 Skills dan 9 Appendix dari buku teks{' '}
          <span className="italic text-white font-medium">
            Longman Complete Course for the TOEFL Test: Preparation for the Computer and Paper Tests
          </span>
          .
        </p>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10">
            <div className="text-xs text-indigo-200 font-medium">Progres Keseluruhan</div>
            <div className="text-2xl font-bold mt-1">{overallPercent}%</div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${overallPercent}%` }} />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10">
            <div className="text-xs text-indigo-200 font-medium">Total Skills Dikuasai</div>
            <div className="text-2xl font-bold mt-1">
              {masteredCount} <span className="text-sm font-normal text-slate-300">/ {totalSkills}</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1">34 List • 60 Struct • 14 Read • 8 Writ</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10">
            <div className="text-xs text-indigo-200 font-medium">Latihan Diselesaikan</div>
            <div className="text-2xl font-bold mt-1">{progress.exercisesCompleted}</div>
            <div className="text-[11px] text-slate-300 mt-1">
              Skor Terakhir: {progress.latestScore !== null ? `${progress.latestScore}%` : 'Belum ada'}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10">
            <div className="text-xs text-indigo-200 font-medium">Materi Aktif Terakhir</div>
            <div className="text-sm font-bold mt-1 line-clamp-2">{progress.lastActiveLesson || 'TOEFL Fundamentals'}</div>
            <button
              onClick={() => onNavigate('fundamentals')}
              className="text-[11px] text-amber-300 hover:text-amber-200 underline mt-1 inline-flex items-center gap-1"
            >
              Lihat Info Format PBT/CBT <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Smart Next Recommendation Card */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border-2 border-indigo-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            <Sparkles className="w-3.5 h-3.5" />
            Rekomendasi Materi Selanjutnya • {nextRecommendation.badge}
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900">{nextRecommendation.title}</h2>
          <p className="text-xs font-medium text-indigo-700">{nextRecommendation.subtitle}</p>
          <p className="text-sm text-slate-600 max-w-2xl">{nextRecommendation.reason}</p>
        </div>
        <button
          onClick={nextRecommendation.action}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition cursor-pointer"
        >
          Lanjutkan Belajar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Core TOEFL Section Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Empat Bagian Utama Kurikulum Longman</h2>
          <SourceBadge type="book" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionCards.map((sec) => {
            const pct = Math.round((sec.mastered / sec.skillCount) * 100);
            const statusText =
              sec.mastered === 0 ? 'Belum Dimulai' : sec.mastered === sec.skillCount ? 'Tuntas 100%' : 'Sedang Berjalan';
            return (
              <div
                key={sec.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-500">{sec.pages}</span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{sec.title}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {sec.priority && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          {sec.priority}
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {sec.skillCount} Skills • {statusText}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">{sec.desc}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Penguasaan Skill</span>
                      <span>
                        {sec.mastered} / {sec.skillCount} Skills ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate(sec.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Mulai Belajar {sec.title.replace('Section ', '')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Grid to Modules 2–12 & Coverage Audit */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">Akses Cepat Modul Pendukung & Evaluasi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickModules.map((mod) => {
            const IconComp = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className="text-left bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl p-4 transition flex items-start gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{mod.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{mod.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// -------------------- MODUL 2: TOEFL FUNDAMENTALS --------------------
function FundamentalsModule({ onNavigate }) {
  const [showIbtNote, setShowIbtNote] = useState(true);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Modul 2 • Introduction (pp. xi–xx)
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              TOEFL Fundamentals: Memahami Kurikulum Longman 2001
            </h1>
          </div>
          <SourceBadge type="book" />
        </div>

        {/* Prominent Historical Context Box */}
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-950">{HISTORICAL_CONTEXT.title}</h3>
              <p className="text-xs md:text-sm text-amber-900 mt-1 leading-relaxed">
                {HISTORICAL_CONTEXT.summary}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {HISTORICAL_CONTEXT.formats.map((fmt, i) => (
              <div key={i} className="bg-white/90 border border-amber-200 rounded-lg p-3">
                <div className="text-xs font-bold text-slate-900">{fmt.name}</div>
                <div className="text-xs font-semibold text-indigo-700 mt-0.5">{fmt.scale}</div>
                <p className="text-xs text-slate-600 mt-1">{fmt.desc}</p>
              </div>
            ))}
          </div>
          <div className="pt-1">
            <button
              onClick={() => setShowIbtNote(!showIbtNote)}
              className="text-xs font-semibold text-amber-900 underline inline-flex items-center gap-1 cursor-pointer"
            >
              {showIbtNote ? 'Sembunyikan' : 'Tampilkan'} Catatan Perbedaan dengan TOEFL iBT Modern
              {showIbtNote ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showIbtNote && (
              <p className="text-xs text-slate-700 bg-white/80 p-3 rounded-lg border border-amber-200 mt-2 leading-relaxed">
                {HISTORICAL_CONTEXT.ibtNote}
              </p>
            )}
          </div>
        </div>

        {/* Apa itu TOEFL & Siapa yang Membutuhkan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">1. Apa itu TOEFL & Tujuannya?</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              <strong>TOEFL (Test of English as a Foreign Language)</strong> dikembangkan oleh Educational Testing Service (ETS) untuk mengukur kemahiran bahasa Inggris akademik penutur non-asli yang ingin melanjutkan studi di universitas berbahasa Inggris, mendaftar program beasiswa, atau memenuhi persyaratan sertifikasi profesional.
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">2. Cara Menggunakan Diagnostic, Post-Test & Complete Test</h3>
            <ul className="text-sm text-slate-600 mt-2 space-y-1.5 list-disc list-inside">
              <li><strong>Diagnostic Pre-Test:</strong> Kerjakan sebelum mempelajari materi tiap section untuk mendeteksi Skill mana yang lemah.</li>
              <li><strong>Skill Exercises & Review Exercises:</strong> Latih setiap aturan secara bertahap lalu gabungkan beberapa skill sekaligus.</li>
              <li><strong>Post-Test & Complete Practice Test:</strong> Ukur peningkatan skor PBT/CBT setelah menyelesaikan seluruh materi.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Visual Diagram: 4 Sections & English Sub-Skills */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          3. Diagram Hubungan 4 Section TOEFL & Sub-Skills Bahasa Inggris
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            {
              sec: 'Listening (34 Skills)',
              sub: ['Idioms & Phrasal Verbs', 'Parafrase & Sinonim', 'Penarikan Kesimpulan (Who/What/Where)', 'Organisasi Kuliah & Diskusi'],
              color: 'border-sky-300 bg-sky-50/60'
            },
            {
              sec: 'Structure (60 Skills)',
              sub: ['Analisis Klausa (S + V + Connector)', 'Reduced Clauses & Inversion', 'Kesepakatan S-V & Parallelism', 'Bentuk Kata (Verb, Noun, Pronoun, Adj/Adv)'],
              color: 'border-indigo-300 bg-indigo-50/60'
            },
            {
              sec: 'Reading (14 Skills)',
              sub: ['Ide Pokok & Organisasi Teks', 'Detail Tersurat & Tersirat', 'Kosakata Kontekstual & Word Parts', 'Rujukan Pronoun & Sisipan Kalimat [■]'],
              color: 'border-emerald-300 bg-emerald-50/60'
            },
            {
              sec: 'Writing (8 Skills)',
              sub: ['Dekode Prompt & Brainstorming', 'Struktur Esai (Intro–Body–Conclusion)', 'Kohesi & Transisi Antar-Paragraf', 'Penyuntingan Tata Bahasa (7A–8F)'],
              color: 'border-amber-300 bg-amber-50/60'
            }
          ].map((box, i) => (
            <div key={i} className={`rounded-xl border-2 p-4 ${box.color}`}>
              <div className="text-sm font-extrabold text-slate-900">{box.sec}</div>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
                {box.sub.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Format Comparison Table: PBT vs CBT */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          4. Tabel Perbandingan Format: Paper-Based TOEFL (PBT) vs Computer-Based TOEFL (CBT)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3 rounded-tl-lg">Section</th>
                <th className="p-3">Paper-Based TOEFL (PBT • 1995)</th>
                <th className="p-3 rounded-tr-lg">Computer-Based TOEFL (CBT • 1998)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {FORMAT_COMPARISON_TABLE.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 align-top">{row.section}</td>
                  <td className="p-3 text-slate-700 align-top">{row.pbt}</td>
                  <td className="p-3 text-slate-700 align-top">{row.cbt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Score Conversion Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">
            5. Tabel Konversi Skor Buku Longman (PBT 217–677 ↔ CBT 0–300 ↔ Writing 1–6)
          </h2>
          <SourceBadge type="book" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-indigo-900 text-white">
                <th className="p-3 rounded-tl-lg">Skor PBT (217–677)</th>
                <th className="p-3">Skor CBT (0–300)</th>
                <th className="p-3">Skor Writing (1–6)</th>
                <th className="p-3 rounded-tr-lg">Kategori Kemahiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {SCORE_CONVERSION_TABLE.map((row, i) => (
                <tr key={i} className="hover:bg-indigo-50/40">
                  <td className="p-3 font-bold text-indigo-900">{row.pbt}</td>
                  <td className="p-3 font-bold text-slate-800">{row.cbt}</td>
                  <td className="p-3 font-semibold text-emerald-700">{row.writing}</td>
                  <td className="p-3 text-slate-600">{row.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end pt-2">
          <button
            onClick={() => onNavigate('diagnostic')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            Lanjut ke Diagnostic Pre-Test (Modul 9)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------- MODUL 3: LISTENING MASTERCLASS (ALL 34 SKILLS) --------------------
function ListeningModule({
  activeSkillNum,
  setActiveSkillNum,
  masteredSkills,
  onToggleMastered,
  onRecordAnswer,
  onAskTutor
}) {
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [showTranscript, setShowTranscript] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showFlashcard, setShowFlashcard] = useState(false);

  const currentSkill = useMemo(
    () => RAW_LISTENING_SKILLS.find((s) => s.num === activeSkillNum) || RAW_LISTENING_SKILLS[0],
    [activeSkillNum]
  );

  const filteredSkills = useMemo(() => {
    if (selectedCat === 'ALL') return RAW_LISTENING_SKILLS;
    return RAW_LISTENING_SKILLS.filter((s) => s.cat === selectedCat);
  }, [selectedCat]);

  useEffect(() => {
    setSelectedOption(null);
    setShowExplanation(false);
  }, [activeSkillNum]);

  const isMastered = masteredSkills.includes(currentSkill.num);

  const handleAnswer = (idx) => {
    setSelectedOption(idx);
    setShowExplanation(true);
    onRecordAnswer({
      section: 'Listening',
      skillNum: currentSkill.num,
      skillRef: `Listening Skill ${currentSkill.num}: ${currentSkill.title}`,
      question: currentSkill.question,
      options: currentSkill.options,
      selectedIndex: idx,
      correctIndex: currentSkill.correct,
      category: 'Listening Comprehension Error',
      explanation: currentSkill.optionAnalysis[currentSkill.correct],
      strategy: currentSkill.strategy,
      extraExample: currentSkill.dialogue.map((d) => `${d.speaker}: "${d.text}"`).join(' ')
    });
  };

  return (
    <div className="space-y-5">
      {/* Header & Category Filter */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
              Modul 3 • Section One: Listening Comprehension (pp. 22–164)
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-0.5">
              Listening Masterclass — Seluruh 34 Skills
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge type="book" />
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              Dikuasai: {masteredSkills.length} / 34
            </span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCat('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedCat === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Kategori (34)
          </button>
          {LISTENING_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCat(cat.id);
                const firstInCat = RAW_LISTENING_SKILLS.find((s) => s.cat === cat.id);
                if (firstInCat) setActiveSkillNum(firstInCat.num);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedCat === cat.id ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Skill Selector Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1 max-h-28 overflow-y-auto">
          {filteredSkills.map((sk) => {
            const done = masteredSkills.includes(sk.num);
            const active = sk.num === currentSkill.num;
            return (
              <button
                key={sk.num}
                onClick={() => setActiveSkillNum(sk.num)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition inline-flex items-center gap-1 cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : done
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {done && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                Skill {sk.num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Listening Skill Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        {/* Skill Title & Prev/Next Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-100 text-sky-800">
                Listening Skill {currentSkill.num} • {currentSkill.page}
              </span>
              <span className="text-xs text-slate-500">
                Kategori {currentSkill.cat}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">{currentSkill.title}</h2>
            <p className="text-sm font-semibold text-indigo-700">{currentSkill.indonesianTitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSkillNum(Math.max(1, currentSkill.num - 1))}
              disabled={currentSkill.num === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              title="Skill Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleMastered(currentSkill.num)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                isMastered
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-800 border border-slate-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isMastered ? 'Sudah Dikuasai' : 'Tandai Dikuasai'}
            </button>
            <button
              onClick={() => setActiveSkillNum(Math.min(34, currentSkill.num + 1))}
              disabled={currentSkill.num === 34}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              title="Skill Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Indonesian Explanation & Key Concept Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">Penjelasan Konsep</span>
              <SourceBadge type="tutor" />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{currentSkill.concept}</p>
          </div>
          <div className="bg-indigo-50/70 rounded-xl p-4 border border-indigo-200 space-y-2">
            <span className="text-xs font-bold uppercase text-indigo-800">Pola Kunci & Strategi TOEFL</span>
            <div className="p-2.5 bg-white rounded-lg border border-indigo-200 font-mono text-xs text-indigo-950 font-semibold">
              {currentSkill.formula}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>Strategi:</strong> {currentSkill.strategy}
            </p>
          </div>
        </div>

        {/* Interactive Organizational Diagram for Academic Discussions / Lectures */}
        {(currentSkill.visualType === 'discussion-org' || currentSkill.visualType === 'lecture-org') && (
          <DiscussionOrgVisualizer />
        )}

        {/* Authentic English Dialogue / Lecture Simulation (Honest Text Mode — No Fake Audio) */}
        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                Mode Simulasi Membaca — Tanpa Audio (Transkrip Buku Longman)
              </span>
            </div>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              {showTranscript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showTranscript ? 'Sembunyikan Transkrip (Uji Ingatan)' : 'Tampilkan Transkrip'}
            </button>
          </div>

          {showTranscript ? (
            <div className="space-y-3 pt-1">
              <div className="bg-slate-800/90 rounded-lg p-3.5 space-y-2 border border-slate-700">
                {currentSkill.dialogue.map((line, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-bold text-amber-300">{line.speaker}: </span>
                    <span className="text-white">"{line.text}"</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                  <div className="font-bold text-slate-300 mb-1">Terjemahan Bahasa Indonesia:</div>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed">{currentSkill.translation}</p>
                </div>
                <div className="bg-emerald-950/60 p-3 rounded-lg border border-emerald-700/50">
                  <div className="font-bold text-emerald-300 mb-1">Identifikasi Petunjuk Jawaban (Answer Clue):</div>
                  <p className="text-emerald-100 leading-relaxed">{currentSkill.clue}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Transkrip disembunyikan untuk melatih fokus Anda. Klik "Tampilkan Transkrip" kapan saja untuk memeriksa teks percakapan.
            </p>
          )}
        </div>

        {/* Mini Flashcards for Idioms / Phrasal Verbs (Skills 16-17 or any skill) */}
        {(currentSkill.num === 16 || currentSkill.num === 17) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">
                Mini-Flashcard Pendukung ({currentSkill.num === 16 ? 'Appendix B: Phrasal Verbs' : 'Appendix C: Idioms'})
              </span>
              <button
                onClick={() => setShowFlashcard(!showFlashcard)}
                className="text-xs font-bold text-indigo-700 underline cursor-pointer"
              >
                {showFlashcard ? 'Tutup Kartu' : 'Buka Kartu Kosakata Cepat'}
              </button>
            </div>
            {showFlashcard && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {(currentSkill.num === 16 ? APPENDIX_DATA[1].items : APPENDIX_DATA[2].items).slice(0, 4).map((it, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-amber-200 text-xs">
                    <div className="font-bold text-slate-900">{it.term}</div>
                    <div className="text-indigo-700 font-medium">{it.meaning}</div>
                    <div className="text-slate-500 italic mt-1">"{it.example}"</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interactive Practice Question */}
        <div className="border-t border-slate-200 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Latihan Interaktif — Listening Skill {currentSkill.num}</h3>
            <button
              onClick={() => onAskTutor(`Jelaskan lebih dalam Listening Skill ${currentSkill.num} (${currentSkill.title}) dan beri contoh tambahan.`)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Tanya Tutor AI
            </button>
          </div>
          <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {currentSkill.question}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {currentSkill.options.map((opt, idx) => {
              let btnStyle = 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800';
              if (showExplanation) {
                if (idx === currentSkill.correct) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                } else if (idx === selectedOption) {
                  btnStyle = 'bg-rose-50 border-rose-500 text-rose-950';
                }
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`text-left p-3.5 rounded-xl border-2 text-sm transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {showExplanation && idx === currentSkill.correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {showExplanation && idx === selectedOption && idx !== currentSkill.correct && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 mt-3">
              <div className="text-xs font-bold uppercase text-indigo-700">Pembahasan Tiap Opsi (Bahasa Indonesia):</div>
              <ul className="space-y-1 text-xs md:text-sm text-slate-700">
                {currentSkill.optionAnalysis.map((line, i) => (
                  <li key={i} className={i === currentSkill.correct ? 'font-semibold text-emerald-800' : ''}>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------- MODUL 4: STRUCTURE MASTERCLASS (ALL 60 SKILLS) --------------------
function StructureModule({
  activeSkillNum,
  setActiveSkillNum,
  masteredSkills,
  onToggleMastered,
  onRecordAnswer,
  onAskTutor
}) {
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentSkill = useMemo(
    () => RAW_STRUCTURE_SKILLS.find((s) => s.num === activeSkillNum) || RAW_STRUCTURE_SKILLS[0],
    [activeSkillNum]
  );

  useEffect(() => {
    setSelectedGroup(currentSkill.group);
    setSelectedOption(null);
    setShowExplanation(false);
  }, [currentSkill]);

  const skillsInGroup = useMemo(
    () => RAW_STRUCTURE_SKILLS.filter((s) => s.group === selectedGroup),
    [selectedGroup]
  );

  const isMastered = masteredSkills.includes(currentSkill.num);

  const handleAnswer = (idx) => {
    setSelectedOption(idx);
    setShowExplanation(true);
    onRecordAnswer({
      section: 'Structure',
      skillNum: currentSkill.num,
      skillRef: `Structure Skill ${currentSkill.num}: ${currentSkill.title}`,
      question: currentSkill.question,
      options: currentSkill.options,
      selectedIndex: idx,
      correctIndex: currentSkill.correct,
      category: 'Grammar Error',
      explanation: currentSkill.optionAnalysis[currentSkill.correct],
      strategy: currentSkill.strategy,
      extraExample: currentSkill.exampleEn
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Group Selector & Navigation */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Modul 4 • Section Two: Structure & Written Expression (pp. 198–330)
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-0.5">
              Structure Masterclass — Lengkap 60 Skills (Grup A–R)
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge type="book" />
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              Dikuasai: {masteredSkills.length} / 60
            </span>
          </div>
        </div>

        {/* 18 Group Selector Dropdown + Quick Foundation Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedGroup}
            onChange={(e) => {
              const g = e.target.value;
              setSelectedGroup(g);
              const first = RAW_STRUCTURE_SKILLS.find((s) => s.group === g);
              if (first) setActiveSkillNum(first.num);
            }}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STRUCTURE_GROUPS.map((grp) => (
              <option key={grp.id} value={grp.id}>
                {grp.name} ({grp.range} • {grp.pages})
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-1.5">
            {skillsInGroup.map((sk) => {
              const done = masteredSkills.includes(sk.num);
              const active = sk.num === currentSkill.num;
              return (
                <button
                  key={sk.num}
                  onClick={() => setActiveSkillNum(sk.num)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition inline-flex items-center gap-1 cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : done
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  Skill {sk.num}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6-Step Learning Flow Indicator */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-500 pt-1">
          {['1. LEARN', '2. UNDERSTAND', '3. SEE EXAMPLES', '4. PRACTICE', '5. REVIEW', '6. MASTER'].map((step, i) => (
            <React.Fragment key={step}>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">{step}</span>
              {i < 5 && <ChevronRight className="w-3 h-3 text-slate-400" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 10-Point Detailed Skill Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        {/* Header & Prev/Next Skill */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
                Structure Skill {currentSkill.num} • {currentSkill.page}
              </span>
              {currentSkill.num <= 19 && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                  Prioritas Fondasi (Skills 1–19)
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">{currentSkill.title}</h2>
            <p className="text-sm font-semibold text-indigo-700">{currentSkill.indonesianTitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSkillNum(Math.max(1, currentSkill.num - 1))}
              disabled={currentSkill.num === 1}
              className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button
              onClick={() => onToggleMastered(currentSkill.num)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                isMastered
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-800 border border-slate-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isMastered ? 'Mastered' : 'Tandai Mastered'}
            </button>
            <button
              onClick={() => setActiveSkillNum(Math.min(60, currentSkill.num + 1))}
              disabled={currentSkill.num === 60}
              className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Points 1 & 2: Tujuan Pembelajaran & Penjelasan Sederhana */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1.5">
            <span className="text-xs font-bold uppercase text-slate-500">1. Tujuan Pembelajaran</span>
            <p className="text-sm text-slate-700 leading-relaxed">{currentSkill.objective}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">2. Penjelasan Sederhana (Bahasa Indonesia)</span>
              <SourceBadge type="tutor" />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{currentSkill.explanation}</p>
          </div>
        </div>

        {/* Points 3 & 4: Rumus Pola Kalimat & Contoh Inggris + Terjemahan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-indigo-50/70 rounded-xl p-4 border border-indigo-200 space-y-2">
            <span className="text-xs font-bold uppercase text-indigo-800">3. Konsep Utama & Rumus Pola Kalimat</span>
            <div className="p-3 bg-white rounded-lg border border-indigo-200 font-mono text-xs md:text-sm font-bold text-indigo-950">
              {currentSkill.formula}
            </div>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200 space-y-1.5">
            <span className="text-xs font-bold uppercase text-emerald-800">4. Contoh Bahasa Inggris + Terjemahan</span>
            <p className="text-sm font-semibold text-slate-900">{currentSkill.exampleEn}</p>
            <p className="text-xs text-slate-600 italic">{currentSkill.exampleId}</p>
          </div>
        </div>

        {/* Point 5: Visual Color-Coded Sentence Analysis */}
        <div>
          <div className="text-xs font-bold uppercase text-slate-500 mb-2">5. Analisis Kalimat Visual</div>
          <GrammarTokenDisplay tokens={currentSkill.tokens} />
        </div>

        {/* Points 6 & 7: Kesalahan Umum & Strategi TOEFL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-rose-50/70 rounded-xl p-4 border border-rose-200 space-y-1">
            <span className="text-xs font-bold uppercase text-rose-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> 6. Kesalahan Umum (Jebakan TOEFL)
            </span>
            <p className="text-sm text-rose-950">{currentSkill.commonMistake}</p>
          </div>
          <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-200 space-y-1">
            <span className="text-xs font-bold uppercase text-amber-800 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" /> 7. Strategi Cepat TOEFL
            </span>
            <p className="text-sm text-amber-950">{currentSkill.strategy}</p>
          </div>
        </div>

        {/* Points 8 & 9: Interactive Exercise & Option-by-Option Discussion */}
        <div className="border-t border-slate-200 pt-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase text-indigo-600">
                8. Latihan Interaktif • {currentSkill.questionType}
              </span>
              <h3 className="text-base font-bold text-slate-900">Uji Pemahaman Structure Skill {currentSkill.num}</h3>
            </div>
            <button
              onClick={() =>
                onAskTutor(
                  `Tolong berikan 2 soal latihan tambahan untuk Structure Skill ${currentSkill.num} (${currentSkill.title}) beserta pembahasan opsi A, B, C, D dalam Bahasa Indonesia.`
                )
              }
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Minta Soal Ekstra ke Tutor
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white font-medium text-sm md:text-base">
            {currentSkill.question}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {currentSkill.options.map((opt, idx) => {
              let btnStyle = 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800';
              if (showExplanation) {
                if (idx === currentSkill.correct) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                } else if (idx === selectedOption) {
                  btnStyle = 'bg-rose-50 border-rose-500 text-rose-950';
                }
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`text-left p-3.5 rounded-xl border-2 text-sm transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {showExplanation && idx === currentSkill.correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {showExplanation && idx === selectedOption && idx !== currentSkill.correct && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 mt-2">
              <div className="text-xs font-bold uppercase text-indigo-700">
                9. Pembahasan Tiap Opsi (Bahasa Indonesia):
              </div>
              <ul className="space-y-1 text-xs md:text-sm text-slate-700">
                {currentSkill.optionAnalysis.map((line, i) => (
                  <li key={i} className={i === currentSkill.correct ? 'font-semibold text-emerald-800' : ''}>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Point 10: Rangkuman & Link Materi Terkait */}
        <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-700">
            <strong>10. Rangkuman & Materi Terkait:</strong> Kuasai rumus <code className="font-mono font-bold text-indigo-900">{currentSkill.formula}</code> lalu hubungkan dengan:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentSkill.relatedSkills.map((rel) => {
              const matchNum = parseInt(rel.replace(/\D/g, ''), 10);
              return (
                <button
                  key={rel}
                  onClick={() => {
                    if (!isNaN(matchNum) && matchNum >= 1 && matchNum <= 60) {
                      setActiveSkillNum(matchNum);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-xs font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                >
                  {rel}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------- MODUL 5: READING MASTERCLASS (ALL 14 SKILLS) --------------------
function ReadingModule({
  activeSkillNum,
  setActiveSkillNum,
  masteredSkills,
  onToggleMastered,
  onRecordAnswer
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [pronounClicked, setPronounClicked] = useState(false);

  const currentSkill = useMemo(
    () => RAW_READING_SKILLS.find((s) => s.num === activeSkillNum) || RAW_READING_SKILLS[0],
    [activeSkillNum]
  );

  useEffect(() => {
    setSelectedOption(null);
    setShowExplanation(false);
    setSelectedSlot(null);
    setPronounClicked(false);
  }, [activeSkillNum]);

  const isMastered = masteredSkills.includes(currentSkill.num);

  const handleAnswer = (idx) => {
    setSelectedOption(idx);
    setShowExplanation(true);
    onRecordAnswer({
      section: 'Reading',
      skillNum: currentSkill.num,
      skillRef: `Reading Skill ${currentSkill.num}: ${currentSkill.title}`,
      question: currentSkill.question,
      options: currentSkill.options,
      selectedIndex: idx,
      correctIndex: currentSkill.correct,
      category: currentSkill.num >= 8 && currentSkill.num <= 11 ? 'Vocabulary Error' : 'Reading Comprehension Error',
      explanation: currentSkill.optionAnalysis[currentSkill.correct],
      strategy: currentSkill.strategy,
      extraExample: currentSkill.sentences[0]
    });
  };

  return (
    <div className="space-y-5">
      {/* Header & Skill Tabs */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Modul 5 • Section Three: Reading Comprehension (pp. 368–451)
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-0.5">
              Reading Masterclass — Seluruh 14 Skills (Grup A–E)
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge type="book" />
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Dikuasai: {masteredSkills.length} / 14
            </span>
          </div>
        </div>

        {/* All 14 Skills Selector */}
        <div className="flex flex-wrap gap-1.5">
          {RAW_READING_SKILLS.map((sk) => {
            const done = masteredSkills.includes(sk.num);
            const active = sk.num === currentSkill.num;
            return (
              <button
                key={sk.num}
                onClick={() => setActiveSkillNum(sk.num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition inline-flex items-center gap-1 cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : done
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                }`}
              >
                {done && <CheckCircle2 className="w-3.5 h-3.5" />}
                Skill {sk.num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Strategy & Split-View Interactive Reader */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
              Reading Skill {currentSkill.num} • {currentSkill.page}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">{currentSkill.title}</h2>
            <p className="text-sm font-semibold text-emerald-700">{currentSkill.indonesianTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSkillNum(Math.max(1, currentSkill.num - 1))}
              disabled={currentSkill.num === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleMastered(currentSkill.num)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                isMastered ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800 border border-slate-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isMastered ? 'Mastered' : 'Tandai Dikuasai'}
            </button>
            <button
              onClick={() => setActiveSkillNum(Math.min(14, currentSkill.num + 1))}
              disabled={currentSkill.num === 14}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Strategy Guide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <div className="text-xs font-bold uppercase text-slate-500">Penjelasan Konsep</div>
            <p className="text-sm text-slate-700 leading-relaxed">{currentSkill.explanation}</p>
          </div>
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-1">
            <div className="text-xs font-bold uppercase text-emerald-800">Lokasi Jawaban & Strategi</div>
            <p className="text-xs text-slate-700">
              <strong>Di mana menemukan jawaban:</strong> {currentSkill.whereToFind}
            </p>
            <p className="text-xs text-slate-700 mt-1">
              <strong>Langkah Kerja:</strong> {currentSkill.strategy}
            </p>
          </div>
        </div>

        {/* Split-View Reader & Question */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* Left: Interactive Passage Viewer */}
          <div className="lg:col-span-6 bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-amber-900">
                Teks Bacaan Akademik: {currentSkill.passageTitle}
              </span>
              <span className="text-[11px] text-slate-500">Kalimat ber-highlight = petunjuk bukti</span>
            </div>

            {/* Special Interactive CBT Mode for Skill 14 ([■] Insertion Slots) */}
            {currentSkill.num === 14 && currentSkill.insertionTask ? (
              <div className="space-y-3 text-sm leading-relaxed text-slate-800">
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950">
                  <strong>Kalimat Baru (Klik salah satu kotak [■] di bawah untuk menyisipkan):</strong>
                  <p className="mt-1 italic font-medium">"{currentSkill.insertionTask.sentenceToInsert}"</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <button
                    onClick={() => {
                      setSelectedSlot(1);
                      handleAnswer(0);
                    }}
                    className={`px-2 py-0.5 rounded font-mono text-xs font-bold mr-1.5 cursor-pointer ${
                      selectedSlot === 1 ? 'bg-rose-600 text-white' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    }`}
                  >
                    [■ 1]
                  </button>
                  <span>{currentSkill.insertionTask.segments[0]} </span>
                  <button
                    onClick={() => {
                      setSelectedSlot(2);
                      handleAnswer(1);
                    }}
                    className={`px-2 py-0.5 rounded font-mono text-xs font-bold mx-1 cursor-pointer ${
                      selectedSlot === 2 ? 'bg-emerald-600 text-white' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    }`}
                  >
                    [■ 2]
                  </button>
                  <span>{currentSkill.insertionTask.segments[1]} </span>
                  <button
                    onClick={() => {
                      setSelectedSlot(3);
                      handleAnswer(2);
                    }}
                    className={`px-2 py-0.5 rounded font-mono text-xs font-bold mx-1 cursor-pointer ${
                      selectedSlot === 3 ? 'bg-rose-600 text-white' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    }`}
                  >
                    [■ 3]
                  </button>
                  <span>{currentSkill.insertionTask.segments[2]} </span>
                  <button
                    onClick={() => {
                      setSelectedSlot(4);
                      handleAnswer(3);
                    }}
                    className={`px-2 py-0.5 rounded font-mono text-xs font-bold ml-1 cursor-pointer ${
                      selectedSlot === 4 ? 'bg-rose-600 text-white' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    }`}
                  >
                    [■ 4]
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5 text-sm leading-relaxed text-slate-800">
                {currentSkill.sentences.map((sent, idx) => {
                  const isHighlighted = showExplanation && currentSkill.highlightIndices?.includes(idx);
                  return (
                    <p
                      key={idx}
                      className={`p-1.5 rounded transition ${
                        isHighlighted ? 'bg-amber-100/90 border-l-4 border-amber-500 font-medium' : ''
                      }`}
                    >
                      <span className="text-[11px] font-mono text-slate-400 mr-1.5">[{idx + 1}]</span>
                      {sent}
                    </p>
                  );
                })}

                {/* Interactive Pronoun Highlighter for Skill 5 */}
                {currentSkill.num === 5 && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Simulasi CBT Click-Referent:</span>
                    <button
                      onClick={() => setPronounClicked(!pronounClicked)}
                      className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 cursor-pointer"
                    >
                      {pronounClicked ? 'Rujukan: "Carnivorous plants / these plants"' : 'Sorot Rujukan Pronoun "They"'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Question & Step-by-Step Analysis */}
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-bold uppercase text-slate-500">
              Pertanyaan Latihan — Reading Skill {currentSkill.num}
            </div>
            <div className="p-4 rounded-xl bg-slate-900 text-white text-sm font-semibold">
              {currentSkill.question}
            </div>
            <div className="space-y-2">
              {currentSkill.options.map((opt, idx) => {
                let btnStyle = 'bg-white border-slate-200 hover:border-emerald-500 text-slate-800';
                if (showExplanation) {
                  if (idx === currentSkill.correct) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-rose-50 border-rose-500 text-rose-950';
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left p-3 rounded-xl border-2 text-sm transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {showExplanation && idx === currentSkill.correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {showExplanation && idx === selectedOption && idx !== currentSkill.correct && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold uppercase text-emerald-800">Analisis Jawaban Langkah demi Langkah:</div>
                <ul className="space-y-1 text-xs text-slate-700">
                  {currentSkill.optionAnalysis.map((line, i) => (
                    <li key={i} className={i === currentSkill.correct ? 'font-semibold text-emerald-800' : ''}>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------- MODUL 6: WRITING MASTERCLASS (SKILLS 1–8) --------------------
function WritingModule({ masteredSkills, onToggleMastered }) {
  const [activeTab, setActiveTab] = useState('skills'); // skills | planner | drills | studio
  const [outline, setOutline] = useState({
    topic: 'Do you agree or disagree that technology has made life easier and more convenient?',
    thesis: '',
    reason1: '',
    example1: '',
    reason2: '',
    example2: '',
    conclusion: ''
  });
  const [drillAnswers, setDrillAnswers] = useState({});
  const [essayText, setEssayText] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [checklist, setChecklist] = useState({
    thesisClear: false,
    twoBodyParagraphs: false,
    specificExamples: false,
    transitionsUsed: false,
    grammarChecked: false
  });
  const [feedbackReport, setFeedbackReport] = useState(null);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const wordCount = useMemo(() => {
    const trimmed = essayText.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [essayText]);

  const paragraphCount = useMemo(() => {
    return essayText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean).length;
  }, [essayText]);

  const runSelfEvaluation = () => {
    const hasTransitions = /(first|second|furthermore|moreover|however|in conclusion|for example|for instance)/i.test(
      essayText
    );
    const notes = [];
    if (wordCount < 150) {
      notes.push('Panjang esai masih di bawah 150 kata. Target ideal esai TOEFL (skor 4.5–6.0) adalah 250–350 kata.');
    } else if (wordCount >= 250) {
      notes.push(`Jumlah kata sangat memadai (${wordCount} kata), sesuai standar esai TOEFL 30 menit.`);
    } else {
      notes.push(`Jumlah kata cukup baik (${wordCount} kata); tambahkan 1 contoh spesifik lagi untuk mencapai 250+ kata.`);
    }

    if (paragraphCount < 3) {
      notes.push('Struktur paragraf masih kurang dari 3. Pastikan memisahkan Introduction, Supporting Paragraphs, dan Conclusion (Skills 3–5).');
    } else {
      notes.push(`Struktur paragraf sudah terbentuk (${paragraphCount} paragraf).`);
    }

    if (!hasTransitions) {
      notes.push('Tambahkan kata transisi antar-paragraf seperti "First of all,", "Furthermore,", "For example,", dan "In conclusion," (Writing Skill 6).');
    } else {
      notes.push('Kata penghubung transisi dan penanda contoh sudah terdeteksi dengan baik.');
    }

    setFeedbackReport(notes);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="space-y-5">
      {/* Header & Tabs */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Modul 6 • Section Four: Writing / TWE & CBT Essay (pp. 473–512)
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-0.5">
              Writing Masterclass — Skills 1–8 & Essay Studio
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SourceBadge type="book" />
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
              Dikuasai: {masteredSkills.length} / 8
            </span>
          </div>
        </div>

        {/* Essay Structure Visual Flow Diagram */}
        <div className="bg-slate-900 text-white rounded-xl p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
            Diagram Alur Struktur Esai TOEFL Longman (Skills 3–6)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/10 rounded-lg p-3 border border-white/15">
              <div className="font-bold text-sky-300">1. Introductory Paragraph (Skill 3)</div>
              <p className="text-slate-300 mt-1">Hook pengantar umum → Konteks topik → Thesis Statement (posisi + peta alasan).</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 border border-white/15">
              <div className="font-bold text-emerald-300">2. Supporting Paragraphs (Skills 4 & 6)</div>
              <p className="text-slate-300 mt-1">Transisi + Topic Sentence 1 + Contoh Spesifik → Transisi + Topic Sentence 2 + Contoh Spesifik.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 border border-white/15">
              <div className="font-bold text-amber-300">3. Concluding Paragraph (Skill 5)</div>
              <p className="text-slate-300 mt-1">Parafrase Thesis Statement → Rangkuman poin utama → Kalimat penutup yang berkesan.</p>
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'skills', label: 'Materi Skills 1–8 & Rubrik Skor 1–6' },
            { id: 'planner', label: 'Interactive Essay Planner (Skills 1–2)' },
            { id: 'drills', label: 'Latihan Sunting Kalimat (Skills 7–8)' },
            { id: 'studio', label: 'Timed 30-Min Essay Studio' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Skills 1-8 & 1-6 Rubric */}
      {activeTab === 'skills' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900">
              A. Understanding the Writing Score (Rubrik 1–6: PBT TWE vs CBT Writing, pp. 473–480)
            </h2>
            <p className="text-xs text-slate-600">
              Pada format PBT (TWE), skor 1–6 dilaporkan terpisah dari skor 217–677. Pada format CBT, skor esai 1–6 digabungkan dengan nilai Structure untuk membentuk setengah dari skor gabungan Structure/Writing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {WRITING_RUBRIC.map((r) => (
                <div key={r.score} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center">
                      {r.score}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{r.label}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WRITING_SKILLS.map((ws) => {
              const done = masteredSkills.includes(ws.num);
              return (
                <div key={ws.num} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900">
                        {ws.stage} • Skill {ws.num} ({ws.page})
                      </span>
                      <button
                        onClick={() => onToggleMastered(ws.num)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                          done ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {done ? 'Mastered' : 'Tandai'}
                      </button>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{ws.title}</h3>
                    <p className="text-xs font-semibold text-indigo-700">{ws.indonesianTitle}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{ws.explanation}</p>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 italic">
                      <strong>Contoh Bahasa Inggris:</strong> "{ws.examplePrompt}"
                    </div>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-2 list-disc list-inside">
                    {ws.tips.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Essay Planner */}
      {activeTab === 'planner' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Interactive Essay Planner & Outline Builder (Skills 1–2)</h2>
            <SourceBadge type="sim" />
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Topik Esai (Prompt):</label>
              <input
                type="text"
                value={outline.topic}
                onChange={(e) => setOutline({ ...outline, topic: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thesis Statement (Posisi Anda + 2 Alasan Utama):</label>
              <textarea
                rows={2}
                placeholder="Contoh: I strongly agree that modern technology has made daily life far more convenient by accelerating communication and simplifying access to education."
                value={outline.thesis}
                onChange={(e) => setOutline({ ...outline, thesis: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-indigo-800">Paragraf Pendukung 1</div>
                <input
                  type="text"
                  placeholder="Topic Sentence 1..."
                  value={outline.reason1}
                  onChange={(e) => setOutline({ ...outline, reason1: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <textarea
                  rows={2}
                  placeholder="Contoh Spesifik 1 (For example...)..."
                  value={outline.example1}
                  onChange={(e) => setOutline({ ...outline, example1: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-indigo-800">Paragraf Pendukung 2</div>
                <input
                  type="text"
                  placeholder="Topic Sentence 2..."
                  value={outline.reason2}
                  onChange={(e) => setOutline({ ...outline, reason2: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <textarea
                  rows={2}
                  placeholder="Contoh Spesifik 2 (For instance...)..."
                  value={outline.example2}
                  onChange={(e) => setOutline({ ...outline, example2: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  const draft = `${outline.thesis}\n\nFirst of all, ${outline.reason1} For example, ${outline.example1}\n\nFurthermore, ${outline.reason2} For instance, ${outline.example2}\n\nIn conclusion, ${outline.thesis}`;
                  setEssayText(draft);
                  setActiveTab('studio');
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                Kirim Kerangka ke Essay Writing Studio <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sentence Editing Error-Fixer Drills */}
      {activeTab === 'drills' && (
        <div className="space-y-4">
          {WRITING_EDITING_DRILLS.map((drill, idx) => {
            const chosen = drillAnswers[drill.id];
            return (
              <div key={drill.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800">
                    Latihan Penyuntingan #{idx + 1} • {drill.skillRef}
                  </span>
                  <SourceBadge type="book" />
                </div>
                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-sm text-rose-950">
                  <strong>Kalimat Bermasalah:</strong> "{drill.faulty}"
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Petunjuk Masalah:</strong> {drill.issue}
                </p>
                <div className="space-y-2">
                  {drill.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => setDrillAnswers({ ...drillAnswers, [drill.id]: oIdx })}
                      className={`w-full text-left p-3 rounded-xl border-2 text-xs md:text-sm transition cursor-pointer ${
                        chosen === undefined
                          ? 'bg-white border-slate-200 hover:border-indigo-400'
                          : oIdx === drill.correct
                          ? 'bg-emerald-50 border-emerald-500 font-semibold text-emerald-950'
                          : chosen === oIdx
                          ? 'bg-rose-50 border-rose-500 text-rose-950'
                          : 'bg-white border-slate-200 opacity-70'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {chosen !== undefined && (
                  <div className="p-3 rounded-lg bg-emerald-50 text-xs text-emerald-900 border border-emerald-200">
                    <strong>Penjelasan Tutor:</strong> {drill.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Timed 30-Minute Essay Writing Studio */}
      {activeTab === 'studio' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Timed 30-Minute Essay Writing Studio</h2>
              <p className="text-xs text-slate-500">
                Bantuan evaluasi mandiri berbasis rubrik Longman (bukan skor resmi ETS TOEFL).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-mono text-sm font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                {timerRunning ? 'Jeda Timer' : 'Mulai 30 Menit'}
              </button>
              <button
                onClick={() => {
                  setTimerRunning(false);
                  setSecondsLeft(30 * 60);
                }}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs md:text-sm text-indigo-950">
            <strong>Prompt Tugas Menulis:</strong> {outline.topic}
          </div>

          <textarea
            rows={10}
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            placeholder="Tulis esai bahasa Inggris Anda di sini (Paragraf 1: Introduction + Thesis, Paragraf 2–3: Supporting Paragraphs + Examples, Paragraf 4: Conclusion)..."
            className="w-full p-4 rounded-xl border border-slate-300 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div>
              Statistik Tulisan: <strong>{wordCount} kata</strong> • <strong>{paragraphCount} paragraf</strong>
            </div>
            <button
              onClick={runSelfEvaluation}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              Periksa Struktur & Checklist Mandiri
            </button>
          </div>

          {/* Indonesian Self-Review Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
            {[
              { key: 'thesisClear', label: 'Thesis Statement jelas di akhir paragraf 1 (Skill 3)' },
              { key: 'twoBodyParagraphs', label: 'Minimal 2 paragraf isi dengan Topic Sentence (Skill 4)' },
              { key: 'specificExamples', label: 'Setiap alasan didukung contoh spesifik (Skill 2)' },
              { key: 'transitionsUsed', label: 'Transisi antar-paragraf halus (Skill 6)' },
              { key: 'grammarChecked', label: 'S-V Agreement, Parallelism & Artikel dicek (Skills 7–8)' }
            ].map((chk) => (
              <label
                key={chk.key}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checklist[chk.key]}
                  onChange={(e) => setChecklist({ ...checklist, [chk.key]: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>{chk.label}</span>
              </label>
            ))}
          </div>

          {feedbackReport && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1.5">
              <div className="text-xs font-bold text-amber-900">
                Hasil Asistensi Struktur Mandiri (Bukan Skor Resmi TOEFL):
              </div>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                {feedbackReport.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -------------------- MODUL 7: APPENDIX & VOCABULARY LAB (A–I) --------------------
function AppendixModule({ memorizedCards, onToggleMemorized }) {
  const [activeAppId, setActiveAppId] = useState('A');
  const [mode, setMode] = useState('reference'); // reference | flashcards
  const [filterUnmemorized, setFilterUnmemorized] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);

  const currentApp = useMemo(
    () => APPENDIX_DATA.find((a) => a.id === activeAppId) || APPENDIX_DATA[0],
    [activeAppId]
  );

  useEffect(() => {
    setCardIndex(0);
    setFlipped(false);
    setQuizAnswer(null);
  }, [activeAppId, filterUnmemorized]);

  const deck = useMemo(() => {
    const base = currentApp.items.map((item, idx) => ({
      ...item,
      cardId: `${currentApp.id}-${idx}`
    }));
    if (filterUnmemorized) {
      return base.filter((c) => !memorizedCards.includes(c.cardId));
    }
    return base;
  }, [currentApp, filterUnmemorized, memorizedCards]);

  const activeCard = deck[cardIndex] || deck[0];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Modul 7 • Appendixes A–I (pp. 565–600)
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-0.5">
              Appendix & Vocabulary Flashcard Lab
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SourceBadge type="book" />
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Kartu Hafal: {memorizedCards.length}
            </span>
          </div>
        </div>

        {/* All 9 Appendix Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {APPENDIX_DATA.map((app) => (
            <button
              key={app.id}
              onClick={() => setActiveAppId(app.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeAppId === app.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Appendix {app.id}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {currentApp.title} <span className="text-xs font-normal text-slate-500">({currentApp.pages})</span>
            </h2>
            <p className="text-xs text-slate-600">{currentApp.desc}</p>
          </div>
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setMode('reference')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                mode === 'reference' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tabel Referensi & Mini-Quiz
            </button>
            <button
              onClick={() => setMode('flashcards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                mode === 'flashcards' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Interactive Flashcard Lab
            </button>
          </div>
        </div>
      </div>

      {mode === 'reference' ? (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3 rounded-tl-lg">Istilah / Pola (English)</th>
                  <th className="p-3">Makna / Aturan (Bahasa Indonesia)</th>
                  <th className="p-3">Contoh Konteks TOEFL</th>
                  <th className="p-3 rounded-tr-lg text-center">Status Hafalan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentApp.items.map((item, idx) => {
                  const cid = `${currentApp.id}-${idx}`;
                  const isMem = memorizedCards.includes(cid);
                  return (
                    <tr key={cid} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-indigo-950">{item.term}</td>
                      <td className="p-3 text-slate-700">{item.meaning}</td>
                      <td className="p-3 text-slate-600 italic">"{item.example}"</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onToggleMemorized(cid)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer ${
                            isMem
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
                          }`}
                        >
                          {isMem ? 'Sudah Hafal' : 'Belum Hafal'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Appendix Mini Quiz */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase text-indigo-600">Mini-Quiz Appendix {currentApp.id}</span>
            <p className="text-sm font-bold text-slate-900">{currentApp.quiz.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentApp.quiz.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuizAnswer(idx)}
                  className={`p-3 rounded-xl border-2 text-left text-xs md:text-sm transition cursor-pointer ${
                    quizAnswer === null
                      ? 'bg-white border-slate-200 hover:border-indigo-400'
                      : idx === currentApp.quiz.correct
                      ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-950'
                      : quizAnswer === idx
                      ? 'bg-rose-50 border-rose-500 text-rose-950'
                      : 'bg-white border-slate-200 opacity-70'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {quizAnswer !== null && (
              <p className="text-xs text-emerald-900 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <strong>Pembahasan:</strong> {currentApp.quiz.explanation}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Interactive Flashcard Lab */
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filterUnmemorized}
                onChange={(e) => setFilterUnmemorized(e.target.checked)}
                className="rounded text-indigo-600"
              />
              Ulangi yang Belum Hafal Saja
            </label>
            <span className="text-xs text-slate-500">
              Kartu {deck.length > 0 ? cardIndex + 1 : 0} dari {deck.length}
            </span>
          </div>

          {deck.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <Award className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="text-base font-bold text-emerald-950">
                Luar Biasa! Semua kartu di Appendix {currentApp.id} sudah ditandai "Sudah Hafal".
              </div>
              <button
                onClick={() => setFilterUnmemorized(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                Tampilkan Semua Kartu Lagi
              </button>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-4">
              <div
                onClick={() => setFlipped(!flipped)}
                className="min-h-56 rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md flex flex-col items-center justify-center text-center cursor-pointer select-none border border-indigo-700/50 transition hover:scale-[1.01]"
              >
                <span className="text-[11px] uppercase tracking-wider text-indigo-300 mb-2">
                  {flipped ? 'Sisi Belakang (Makna & Contoh TOEFL)' : 'Sisi Depan (Klik Kartu untuk Membalik)'}
                </span>
                {!flipped ? (
                  <div className="text-2xl font-extrabold text-white">{activeCard.term}</div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-amber-300">{activeCard.meaning}</div>
                    <p className="text-sm text-slate-200 italic">"{activeCard.example}"</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setFlipped(false);
                    setCardIndex((prev) => (prev - 1 + deck.length) % deck.length);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  ← Sebelumnya
                </button>

                <button
                  onClick={() => onToggleMemorized(activeCard.cardId)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                    memorizedCards.includes(activeCard.cardId)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {memorizedCards.includes(activeCard.cardId) ? 'Sudah Hafal' : 'Tandai Sudah Hafal'}
                </button>

                <button
                  onClick={() => {
                    setFlipped(false);
                    setCardIndex((prev) => (prev + 1) % deck.length);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Berikutnya →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -------------------- MODUL 8: TOEFL PRACTICE CENTER --------------------
function PracticeCenterModule({ mistakes, onRecordAnswer, onNavigate }) {
  const [sectionFilter, setSectionFilter] = useState('ALL'); // ALL | Listening | Structure | Reading | Writing
  const [practiceMode, setPracticeMode] = useState('Practice Mode'); // Practice Mode | Timed Mode | Review Mode | Mixed Practice | Challenge Mode
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);

  // Build unified practice pool across sections
  const unifiedPool = useMemo(() => {
    const listPool = RAW_LISTENING_SKILLS.map((s) => ({
      id: `L-${s.num}`,
      section: 'Listening',
      skillNum: s.num,
      skillRef: `Listening Skill ${s.num}: ${s.title}`,
      prompt: `${s.dialogue.map((d) => `${d.speaker}: "${d.text}"`).join(' | ')} — ${s.question}`,
      options: s.options,
      correct: s.correct,
      category: 'Listening Comprehension Error',
      explanation: s.optionAnalysis[s.correct],
      strategy: s.strategy,
      isChallenge: s.num >= 14
    }));
    const structPool = RAW_STRUCTURE_SKILLS.map((s) => ({
      id: `S-${s.num}`,
      section: 'Structure',
      skillNum: s.num,
      skillRef: `Structure Skill ${s.num}: ${s.title}`,
      prompt: s.question,
      options: s.options,
      correct: s.correct,
      category: 'Grammar Error',
      explanation: s.optionAnalysis[s.correct],
      strategy: s.strategy,
      isChallenge: s.num >= 15 && s.num <= 29
    }));
    const readPool = RAW_READING_SKILLS.map((s) => ({
      id: `R-${s.num}`,
      section: 'Reading',
      skillNum: s.num,
      skillRef: `Reading Skill ${s.num}: ${s.title}`,
      prompt: `[${s.passageTitle}] ${s.sentences[0]} — ${s.question}`,
      options: s.options,
      correct: s.correct,
      category: s.num >= 8 && s.num <= 11 ? 'Vocabulary Error' : 'Reading Comprehension Error',
      explanation: s.optionAnalysis[s.correct],
      strategy: s.strategy,
      isChallenge: s.num >= 6
    }));
    const writPool = WRITING_EDITING_DRILLS.map((w, idx) => ({
      id: `W-${idx + 1}`,
      section: 'Writing',
      skillNum: idx + 7,
      skillRef: w.skillRef,
      prompt: `Perbaiki kesalahan struktur/tata bahasa esai berikut: "${w.faulty}"`,
      options: w.options,
      correct: w.correct,
      category: 'Writing Organization Error',
      explanation: w.explanation,
      strategy: 'Periksa kalimat majemuk (Skill 7) dan kesejajaran struktur serta artikel (Skill 8).',
      isChallenge: true
    }));

    let combined = [...structPool, ...listPool, ...readPool, ...writPool];
    if (sectionFilter !== 'ALL') {
      combined = combined.filter((item) => item.section === sectionFilter);
    }
    if (practiceMode === 'Challenge Mode') {
      combined = combined.filter((item) => item.isChallenge);
    }
    if (practiceMode === 'Review Mode' && mistakes.length > 0) {
      return mistakes.map((m, i) => ({
        id: `REV-${i}`,
        section: m.section || 'Structure',
        skillNum: m.skillNum || 1,
        skillRef: m.skillRef,
        prompt: m.question,
        options: m.options || ['(A)', '(B)', '(C)', '(D)'],
        correct: m.correctIndex,
        category: m.category,
        explanation: m.explanation,
        strategy: m.strategy
      }));
    }
    return combined;
  }, [sectionFilter, practiceMode, mistakes]);

  const currentItem = unifiedPool[qIndex % Math.max(1, unifiedPool.length)];

  useEffect(() => {
    setSelectedOpt(null);
    if (practiceMode === 'Timed Mode' && currentItem) {
      setTimeLeft(currentItem.section === 'Reading' ? 60 : 30);
    }
  }, [qIndex, practiceMode, sectionFilter, currentItem]);

  useEffect(() => {
    if (practiceMode !== 'Timed Mode' || selectedOpt !== null) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [practiceMode, selectedOpt]);

  const handleChoose = (idx) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    onRecordAnswer({
      section: currentItem.section,
      skillNum: currentItem.skillNum,
      skillRef: currentItem.skillRef,
      question: currentItem.prompt,
      options: currentItem.options,
      selectedIndex: idx,
      correctIndex: currentItem.correct,
      category: timeLeft === 0 && practiceMode === 'Timed Mode' ? 'Time Management Error' : currentItem.category,
      explanation: currentItem.explanation,
      strategy: currentItem.strategy,
      extraExample: currentItem.prompt
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Modul 8 • Bank Soal Interaktif Terintegrasi
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-0.5">
              TOEFL Practice Center (5 Mode Latihan)
            </h1>
          </div>
          <SourceBadge type="sim" />
        </div>

        {/* Section Filter */}
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'Structure', 'Listening', 'Reading', 'Writing'].map((sec) => (
            <button
              key={sec}
              onClick={() => {
                setSectionFilter(sec);
                setQIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                sectionFilter === sec ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sec === 'ALL' ? 'Semua Section' : sec}
            </button>
          ))}
        </div>

        {/* 5 Practice Modes */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
          {['Practice Mode', 'Timed Mode', 'Review Mode', 'Mixed Practice', 'Challenge Mode'].map((modeName) => (
            <button
              key={modeName}
              onClick={() => {
                setPracticeMode(modeName);
                setQIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                practiceMode === modeName
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {modeName}
              {modeName === 'Review Mode' && ` (${mistakes.length})`}
            </button>
          ))}
        </div>
      </div>

      {practiceMode === 'Review Mode' && mistakes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Belum Ada Kesalahan di Daftar Review Mode</h3>
          <p className="text-xs text-slate-600">
            Setiap jawaban salah dari latihan atau tes diagnostik akan otomatis muncul di sini dan di Modul 10 (My Mistakes).
          </p>
        </div>
      ) : (
        currentItem && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
                  {currentItem.section} • {currentItem.skillRef}
                </span>
                <span className="text-xs text-slate-500">
                  Soal {(qIndex % unifiedPool.length) + 1} dari {unifiedPool.length}
                </span>
              </div>

              {practiceMode === 'Timed Mode' && (
                <div
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 ${
                    timeLeft <= 5 ? 'bg-rose-600 text-white' : 'bg-slate-900 text-amber-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {timeLeft} detik
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white text-sm md:text-base leading-relaxed">
              {currentItem.prompt}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {currentItem.options.map((opt, idx) => {
                let style = 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800';
                if (selectedOpt !== null) {
                  if (idx === currentItem.correct) {
                    style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                  } else if (idx === selectedOpt) {
                    style = 'bg-rose-50 border-rose-500 text-rose-950';
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleChoose(idx)}
                    className={`text-left p-3.5 rounded-xl border-2 text-sm transition cursor-pointer ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedOpt !== null && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="text-xs font-bold uppercase text-indigo-700">Pembahasan & Rujukan Buku Longman:</div>
                <p className="text-xs md:text-sm text-slate-700">{currentItem.explanation}</p>
                <p className="text-xs text-slate-600">
                  <strong>Strategi:</strong> {currentItem.strategy}
                </p>
                <div className="flex flex-wrap justify-between items-center gap-2 pt-2">
                  <button
                    onClick={() => onNavigate(currentItem.section.toLowerCase())}
                    className="text-xs font-bold text-indigo-700 underline cursor-pointer"
                  >
                    Buka Materi {currentItem.skillRef} →
                  </button>
                  <button
                    onClick={() => setQIndex((prev) => prev + 1)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Soal Berikutnya →
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

// -------------------- MODUL 9: DIAGNOSTIC TEST & PROGRESS EVALUATION --------------------
function DiagnosticModule({ onRecordAnswer, onNavigate }) {
  const [subTab, setSubTab] = useState('pretest'); // pretest | posttest | complete | report
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const testSet = useMemo(() => {
    if (subTab === 'pretest') return DIAGNOSTIC_QUESTIONS;
    if (subTab === 'posttest') return [...DIAGNOSTIC_QUESTIONS].reverse();
    return DIAGNOSTIC_QUESTIONS;
  }, [subTab]);

  const handleSelect = (qId, idx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: idx }));
  };

  const handleSubmitTest = () => {
    const secs = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    setElapsedSeconds(secs);
    setSubmitted(true);
    setSubTab('report');

    testSet.forEach((q) => {
      const chosen = answers[q.id];
      if (chosen !== undefined) {
        onRecordAnswer({
          section: q.section,
          skillNum: 1,
          skillRef: q.skillRef,
          question: q.prompt,
          options: q.options,
          selectedIndex: chosen,
          correctIndex: q.correct,
          category: q.category,
          explanation: q.explanation,
          strategy: `Tinjau kembali ${q.skillRef} pada modul masterclass terkait.`,
          extraExample: q.prompt
        });
      }
    });
  };

  const resetExam = (nextTab) => {
    setAnswers({});
    setSubmitted(false);
    setStartTime(Date.now());
    setSubTab(nextTab);
  };

  const stats = useMemo(() => {
    let correctCount = 0;
    const weakSkills = [];
    const strongSkills = [];

    testSet.forEach((q) => {
      const chosen = answers[q.id];
      if (chosen === q.correct) {
        correctCount++;
        strongSkills.push(q.skillRef);
      } else {
        weakSkills.push(q.skillRef);
      }
    });

    const accuracy = Math.round((correctCount / testSet.length) * 100);
    const estPbt = Math.round(310 + (accuracy / 100) * 367);
    const estCbt = Math.round(40 + (accuracy / 100) * 260);
    return { correctCount, incorrectCount: testSet.length - correctCount, accuracy, estPbt, estCbt, weakSkills, strongSkills };
  }, [answers, testSet]);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Modul 9 • Diagnostic Pre-Test, Post-Test & Complete Test
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-0.5">
              Diagnostic Test & Progress Evaluation
            </h1>
          </div>
          <SourceBadge type="book" />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'pretest', label: 'A. Diagnostic Pre-Test' },
            { id: 'posttest', label: 'B. Section Post-Test' },
            { id: 'complete', label: 'C. Complete Practice Test' },
            { id: 'report', label: 'D. Hasil Evaluasi & Diagnostic Chart' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (t.id === 'report') setSubTab('report');
                else resetExam(t.id);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                subTab === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {subTab !== 'report' ? (
        <div className="space-y-4">
          {testSet.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800">
                  Soal #{idx + 1} • {q.section} ({q.skillRef})
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(q.id, oIdx)}
                    className={`text-left p-3 rounded-xl border-2 text-xs md:text-sm transition cursor-pointer ${
                      answers[q.id] === oIdx
                        ? 'bg-indigo-50 border-indigo-600 font-bold text-indigo-950'
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={handleSubmitTest}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm cursor-pointer"
            >
              Selesaikan Tes & Lihat Hasil Evaluasi
            </button>
          </div>
        </div>
      ) : (
        /* D. Hasil Evaluasi & Diagnostic Chart */
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold text-slate-900">Hasil Evaluasi & Diagnostic Chart</h2>
            <button
              onClick={() => resetExam('pretest')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
            >
              Ulangi Tes Diagnostik
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs font-semibold text-emerald-800">Jawaban Benar</div>
              <div className="text-2xl font-extrabold text-emerald-950 mt-1">
                {stats.correctCount} / {testSet.length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <div className="text-xs font-semibold text-rose-800">Jawaban Salah</div>
              <div className="text-2xl font-extrabold text-rose-950 mt-1">{stats.incorrectCount}</div>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="text-xs font-semibold text-indigo-800">Akurasi & Waktu</div>
              <div className="text-2xl font-extrabold text-indigo-950 mt-1">{stats.accuracy}%</div>
              <div className="text-[11px] text-indigo-700">Durasi: {elapsedSeconds} detik</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-xs font-semibold text-amber-900">Estimasi Latihan (Non-Resmi)</div>
              <div className="text-sm font-extrabold text-amber-950 mt-1">
                PBT ~{stats.estPbt} • CBT ~{stats.estCbt}
              </div>
              <div className="text-[10px] text-amber-800 mt-0.5">Estimasi internal latihan, bukan skor resmi ETS</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
              <div className="text-xs font-bold uppercase text-rose-800">Skills yang Perlu Diperkuat (Weak Skills)</div>
              {stats.weakSkills.length === 0 ? (
                <p className="text-xs text-slate-600">Tidak ada! Semua soal diagnostik dijawab benar.</p>
              ) : (
                <ul className="space-y-1 text-xs text-rose-950 list-disc list-inside">
                  {stats.weakSkills.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="text-xs font-bold uppercase text-emerald-800">Skills yang Sudah Dikuasai (Mastered)</div>
              {stats.strongSkills.length === 0 ? (
                <p className="text-xs text-slate-600">Belum ada soal yang dijawab benar pada sesi ini.</p>
              ) : (
                <ul className="space-y-1 text-xs text-emerald-950 list-disc list-inside">
                  {stats.strongSkills.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => onNavigate('mistakes')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              Bedah Jawaban Salah di Modul 10 (My Mistakes) <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------- MODUL 10: ANSWER REVIEW & MISTAKE ANALYZER --------------------
function MistakesModule({ mistakes, onClearMistakes, onSelectSkill }) {
  const [catFilter, setCatFilter] = useState('ALL');

  const errorCategories = [
    'Grammar Error',
    'Vocabulary Error',
    'Listening Comprehension Error',
    'Reading Comprehension Error',
    'Inference Error',
    'Time Management Error',
    'Writing Organization Error'
  ];

  const filteredMistakes = useMemo(() => {
    if (catFilter === 'ALL') return mistakes;
    return mistakes.filter((m) => m.category === catFilter);
  }, [mistakes, catFilter]);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Modul 10 • Answer Review & Mistake Analyzer
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-0.5">
              My Mistakes — Bedah Kesalahan 7 Poin Terstruktur
            </h1>
          </div>
          {mistakes.length > 0 && (
            <button
              onClick={onClearMistakes}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-rose-50 hover:text-rose-700 text-xs font-bold cursor-pointer"
            >
              Bersihkan Daftar Kesalahan
            </button>
          )}
        </div>

        {/* 7 Error Category Filters */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCatFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              catFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Semua Kategori ({mistakes.length})
          </button>
          {errorCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                catFilter === cat ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredMistakes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Tidak Ada Catatan Kesalahan pada Kategori Ini</h3>
          <p className="text-xs text-slate-600">
            Kerjakan latihan di Modul 3–6, Practice Center (Modul 8), atau Diagnostic Test (Modul 9). Setiap jawaban salah akan dibedah otomatis di sini dalam 7 poin analisis.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map((m, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    {m.category}
                  </span>
                  <span className="text-xs font-bold text-indigo-700">{m.skillRef}</span>
                </div>
                <button
                  onClick={() =>
                    onSelectSkill((m.section || 'structure').toLowerCase(), m.skillNum || 1)
                  }
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  Pelajari Skill Ini →
                </button>
              </div>

              <p className="text-sm font-bold text-slate-900">{m.question}</p>

              {/* 7-Point Structured Dissection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="font-bold text-rose-900">1. Jawaban yang Dipilih Pengguna:</div>
                  <div className="text-rose-800 mt-0.5">{m.options?.[m.selectedIndex] || 'Waktu habis / Tidak dipilih'}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="font-bold text-emerald-900">2. Jawaban yang Benar:</div>
                  <div className="text-emerald-800 mt-0.5">{m.options?.[m.correctIndex]}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">3. Mengapa Jawaban Pengguna Salah:</div>
                  <div className="text-slate-700 mt-0.5">
                    Opsi yang dipilih belum memenuhi kaidah {m.skillRef} atau terkecoh pengecoh konteks.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">4. Konsep yang Belum Dipahami:</div>
                  <div className="text-slate-700 mt-0.5">{m.explanation}</div>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
                  <div className="font-bold text-indigo-900">5. Skill Longman yang Berkaitan:</div>
                  <div className="text-indigo-800 mt-0.5">{m.skillRef}</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                  <div className="font-bold text-amber-900">6. Strategi Menghindari Jebakan Serupa:</div>
                  <div className="text-amber-950 mt-0.5">{m.strategy}</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs">
                <strong className="text-amber-300">7. Contoh Penguat Pemahaman:</strong> {m.extraExample}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------- MODUL 11: PERSONAL STUDY PLAN --------------------
function StudyPlanModule({ progress, mistakes, onNavigate, onSelectSkill }) {
  const foundationDone = RAW_STRUCTURE_SKILLS.filter(
    (s) => s.num <= 19 && progress.structureMastered.includes(s.num)
  ).length;

  const stages = [
    {
      stage: 'Tahap 1 — Foundation',
      status: progress.exercisesCompleted > 0 ? 'Selesai / Aktif' : 'Langkah Awal',
      desc: 'Pahami struktur ujian historis PBT & CBT di TOEFL Fundamentals (pp. xi–xx) dan kerjakan Diagnostic Pre-Test untuk memetakan kemampuan awal.',
      metrics: `Latihan dikerjakan: ${progress.exercisesCompleted} soal`,
      actions: [
        { label: 'Buka TOEFL Fundamentals', fn: () => onNavigate('fundamentals') },
        { label: 'Kerjakan Diagnostic Pre-Test', fn: () => onNavigate('diagnostic') }
      ]
    },
    {
      stage: 'Tahap 2 — Core Skills (Prioritas Structure Skills 1–19)',
      status: `${foundationDone}/19 Fondasi Structure Dikuasai`,
      desc: 'Kuasai Structure Skills 1–19 terlebih dahulu (One/Multiple Clauses, Reduced Clauses, Inversion), lalu lanjutkan Structure 20–60, Listening 1–34, Reading 1–14, dan Writing 1–8.',
      metrics: `Total dikuasai: ${
        progress.structureMastered.length +
        progress.listeningMastered.length +
        progress.readingMastered.length +
        progress.writingMastered.length
      } / 116 Skills`,
      actions: [
        { label: 'Pelajari Structure 1–19', fn: () => onSelectSkill('structure', 1) },
        { label: 'Buka Listening Masterclass', fn: () => onSelectSkill('listening', 1) }
      ]
    },
    {
      stage: 'Tahap 3 — Skill Reinforcement',
      status: `${mistakes.length} Kesalahan Perlu Direview`,
      desc: 'Perkuat kosakata idiomatik dan bentuk kata di Appendix A–I Flashcard Lab, serta bedah seluruh kesalahan di My Mistakes Analyzer.',
      metrics: `Kartu Appendix hafal: ${progress.memorizedCards.length} kartu`,
      actions: [
        { label: 'Buka Appendix A–I Lab', fn: () => onNavigate('appendix') },
        { label: 'Bedah My Mistakes', fn: () => onNavigate('mistakes') }
      ]
    },
    {
      stage: 'Tahap 4 — Test Preparation',
      status: 'Simulasi Penuh PBT & CBT',
      desc: 'Latih kecepatan dengan Timed Mode di TOEFL Practice Center dan kerjakan Post-Test serta Complete Practice Test.',
      metrics: 'Target: Akurasi ≥ 80% di seluruh section',
      actions: [
        { label: 'TOEFL Practice Center', fn: () => onNavigate('practice') },
        { label: 'Complete Practice Test', fn: () => onNavigate('diagnostic') }
      ]
    }
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Modul 11 • Peta Jalan Belajar Adaptif (Bebas Akses Tanpa Kunci Paksa)
        </span>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
          Personal Study Plan — Kurikulum 4 Tahap Longman
        </h1>
        <p className="text-sm text-slate-600">
          Seluruh modul tetap dapat diakses bebas kapan saja, namun mengikuti urutan 4 tahap berikut memberikan hasil penguasaan tata bahasa dan strategi yang paling kokoh.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stages.map((st, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-extrabold">
                  {st.stage}
                </span>
                <span className="text-xs font-semibold text-emerald-700">{st.status}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{st.desc}</p>
              <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                {st.metrics}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {st.actions.map((act, aIdx) => (
                <button
                  key={aIdx}
                  onClick={act.fn}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition cursor-pointer"
                >
                  {act.label} →
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------- MODUL 12: TOEFL STUDY ASSISTANT (VIRTUAL TUTOR) --------------------
function VirtualTutorModule({ initialPrompt, onClearInitialPrompt, contextSummary }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Halo! Saya **TOEFL Study Assistant** Anda untuk buku *Longman Complete Course for the TOEFL Test* (Deborah Phillips, 2001). Saya menjelaskan semua materi dalam Bahasa Indonesia dengan mempertahankan contoh bahasa Inggris dan istilah inti grammar. Apa yang ingin kita pelajari atau bedah hari ini?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const quickPrompts = [
    'Jelaskan ulang lebih sederhana',
    'Beri 3 contoh kalimat tambahan',
    'Bedakan dua konsep grammar (mis. Present Participle vs Verb)',
    'Bedah soal yang salah',
    'Buatkan jadwal belajar',
    'Uji pemahaman saya dengan 2 soal'
  ];

  const handleSend = async (promptText) => {
    const q = (promptText || input).trim();
    if (!q || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    const reply = await callGeminiTutor(q, contextSummary);
    setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    setLoading(false);
  };

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
      onClearInitialPrompt();
    }
  }, [initialPrompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Modul 12 • Virtual Tutor Berbasis Kurikulum Longman 2001
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-0.5">
              TOEFL Study Assistant
            </h1>
          </div>
          <SourceBadge type="tutor" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((qp) => (
            <button
              key={qp}
              onClick={() => handleSend(qp)}
              className="px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold transition cursor-pointer"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Transcript Window */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-600 text-xs font-semibold animate-pulse">
                Tutor sedang menyusun penjelasan berdasarkan buku Longman...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-slate-200 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan konsep grammar, nomor skill Longman, atau tempelkan kalimat bahasa Inggris..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" /> Kirim
          </button>
        </form>
      </div>
    </div>
  );
}

// -------------------- CONTENT COVERAGE CHECKLIST (100% AUDIT) --------------------
function CoverageChecklistModule({ progress, onSelectSkill, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');

  const allItems = useMemo(() => {
    const list = RAW_LISTENING_SKILLS.map((s) => ({
      section: 'Listening',
      code: `Listening Skill ${s.num}`,
      title: `${s.title} — ${s.indonesianTitle}`,
      pages: s.page,
      mastered: progress.listeningMastered.includes(s.num),
      go: () => onSelectSkill('listening', s.num)
    }));
    const struct = RAW_STRUCTURE_SKILLS.map((s) => ({
      section: 'Structure',
      code: `Structure Skill ${s.num}`,
      title: `${s.title} — ${s.indonesianTitle}`,
      pages: s.page,
      mastered: progress.structureMastered.includes(s.num),
      go: () => onSelectSkill('structure', s.num)
    }));
    const read = RAW_READING_SKILLS.map((s) => ({
      section: 'Reading',
      code: `Reading Skill ${s.num}`,
      title: `${s.title} — ${s.indonesianTitle}`,
      pages: s.page,
      mastered: progress.readingMastered.includes(s.num),
      go: () => onSelectSkill('reading', s.num)
    }));
    const writ = WRITING_SKILLS.map((s) => ({
      section: 'Writing',
      code: `Writing Skill ${s.num}`,
      title: `${s.title} — ${s.indonesianTitle}`,
      pages: s.page,
      mastered: progress.writingMastered.includes(s.num),
      go: () => onNavigate('writing')
    }));
    const app = APPENDIX_DATA.map((a) => ({
      section: 'Appendix',
      code: `Appendix ${a.id}`,
      title: `${a.title} — ${a.desc}`,
      pages: a.pages,
      mastered: progress.memorizedCards.some((c) => c.startsWith(`${a.id}-`)),
      go: () => onNavigate('appendix')
    }));
    return [...list, ...struct, ...read, ...writ, ...app];
  }, [progress, onSelectSkill, onNavigate]);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      const matchSec = sectionFilter === 'ALL' || item.section === sectionFilter;
      const q = searchQuery.toLowerCase();
      const matchText =
        !q ||
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.pages.toLowerCase().includes(q);
      return matchSec && matchText;
    });
  }, [allItems, sectionFilter, searchQuery]);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Audit Kelengkapan Buku Deborah Phillips (2001 • 687 Halaman)
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-0.5">
              Content Coverage Checklist (116 Skills + 9 Appendixes)
            </h1>
          </div>
          <SourceBadge type="book" />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor skill, judul materi, atau nomor halaman (mis. Skill 17, Inversion, p. 239)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {['ALL', 'Listening', 'Structure', 'Reading', 'Writing', 'Appendix'].map((sec) => (
              <button
                key={sec}
                onClick={() => setSectionFilter(sec)}
                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  sectionFilter === sec ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-3">Section</th>
              <th className="p-3">Skill / Appendix</th>
              <th className="p-3">Topik & Penjelasan</th>
              <th className="p-3">Halaman</th>
              <th className="p-3">Status Materi</th>
              <th className="p-3">Latihan & Pembahasan</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-700">{item.section}</td>
                <td className="p-3 font-bold text-indigo-900">{item.code}</td>
                <td className="p-3 text-slate-700 max-w-md">{item.title}</td>
                <td className="p-3 font-mono text-xs text-slate-500">{item.pages}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Selesai (100%)
                  </span>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    Tersedia + Pembahasan ID
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={item.go}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Buka
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 10. MAIN APP SHELL & LOCALSTORAGE PERSISTENCE
// ============================================================================

const STORAGE_KEY = 'toefl_longman_companion_v1';

const DEFAULT_PROGRESS = {
  listeningMastered: [],
  structureMastered: [],
  readingMastered: [],
  writingMastered: [],
  memorizedCards: [],
  exercisesCompleted: 0,
  latestScore: null,
  lastActiveLesson: 'Modul 1: Learning Dashboard'
};

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeListeningSkill, setActiveListeningSkill] = useState(1);
  const [activeStructureSkill, setActiveStructureSkill] = useState(1);
  const [activeReadingSkill, setActiveReadingSkill] = useState(1);
  const [tutorPrompt, setTutorPrompt] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PROGRESS, ...(parsed.progress || {}) };
      }
    } catch (_e) {
      // Ignore storage errors
    }
    return DEFAULT_PROGRESS;
  });

  const [mistakes, setMistakes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed.mistakes) ? parsed.mistakes : [];
      }
    } catch (_e) {
      // Ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ progress, mistakes }));
    } catch (_e) {
      // Ignore storage errors
    }
  }, [progress, mistakes]);

  const toggleSkillMastered = (sectionKey, num) => {
    setProgress((prev) => {
      const list = prev[sectionKey] || [];
      const updated = list.includes(num) ? list.filter((n) => n !== num) : [...list, num];
      return { ...prev, [sectionKey]: updated };
    });
  };

  const toggleMemorizedCard = (cardId) => {
    setProgress((prev) => {
      const list = prev.memorizedCards || [];
      const updated = list.includes(cardId) ? list.filter((c) => c !== cardId) : [...list, cardId];
      return { ...prev, memorizedCards: updated };
    });
  };

  const handleRecordAnswer = (record) => {
    const isCorrect = record.selectedIndex === record.correctIndex;
    setProgress((prev) => ({
      ...prev,
      exercisesCompleted: prev.exercisesCompleted + 1,
      latestScore: isCorrect ? 100 : 0,
      lastActiveLesson: record.skillRef
    }));

    if (!isCorrect) {
      setMistakes((prev) => {
        const exists = prev.some((m) => m.question === record.question);
        if (exists) return prev;
        return [record, ...prev];
      });
    }
  };

  const handleSelectSkill = (section, num) => {
    if (section === 'listening') {
      setActiveListeningSkill(num);
      setActiveModule('listening');
      setProgress((p) => ({ ...p, lastActiveLesson: `Listening Skill ${num}` }));
    } else if (section === 'structure') {
      setActiveStructureSkill(num);
      setActiveModule('structure');
      setProgress((p) => ({ ...p, lastActiveLesson: `Structure Skill ${num}` }));
    } else if (section === 'reading') {
      setActiveReadingSkill(num);
      setActiveModule('reading');
      setProgress((p) => ({ ...p, lastActiveLesson: `Reading Skill ${num}` }));
    } else {
      setActiveModule('writing');
    }
    setSidebarOpen(false);
  };

  const handleAskTutor = (promptText) => {
    setTutorPrompt(promptText);
    setActiveModule('tutor');
  };

  const navItems = [
    { id: 'dashboard', label: '1. Learning Dashboard', icon: LayoutDashboard },
    { id: 'fundamentals', label: '2. TOEFL Fundamentals', icon: Compass },
    { id: 'listening', label: '3. Listening (34 Skills)', icon: Headphones, badge: `${progress.listeningMastered.length}/34` },
    { id: 'structure', label: '4. Structure (60 Skills)', icon: Layers, badge: `${progress.structureMastered.length}/60` },
    { id: 'reading', label: '5. Reading (14 Skills)', icon: BookOpen, badge: `${progress.readingMastered.length}/14` },
    { id: 'writing', label: '6. Writing (Skills 1–8)', icon: PenTool, badge: `${progress.writingMastered.length}/8` },
    { id: 'appendix', label: '7. Appendix A–I Lab', icon: BookMarked },
    { id: 'practice', label: '8. Practice Center', icon: Target },
    { id: 'diagnostic', label: '9. Diagnostic & Tests', icon: TrendingUp },
    { id: 'mistakes', label: '10. My Mistakes', icon: ShieldAlert, badge: mistakes.length > 0 ? `${mistakes.length}` : null },
    { id: 'studyplan', label: '11. Personal Study Plan', icon: Calendar },
    { id: 'tutor', label: '12. Virtual Tutor AI', icon: MessageSquare },
    { id: 'checklist', label: 'Audit Coverage (100%)', icon: ListChecks }
  ];

  const contextSummary = `Dikuasai: Listening ${progress.listeningMastered.length}/34, Structure ${progress.structureMastered.length}/60, Reading ${progress.readingMastered.length}/14, Writing ${progress.writingMastered.length}/8. Total kesalahan tercatat: ${mistakes.length}.`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col lg:flex-row">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden"
        />
      )}

      {/* Left Collapsible Navigation Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-white">TOEFL Companion</div>
              <div className="text-[11px] text-indigo-300 font-medium">Longman Complete (2001)</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
          <div>Format Historis: PBT (217–677) & CBT (0–300)</div>
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Reset Progres Belajar
            </button>
          ) : (
            <div className="bg-slate-800 p-2.5 rounded-lg space-y-2">
              <div className="text-white font-semibold">Yakin hapus semua progres?</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setProgress(DEFAULT_PROGRESS);
                    setMistakes([]);
                    setShowResetConfirm(false);
                  }}
                  className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold cursor-pointer"
                >
                  Ya, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1 rounded bg-slate-700 text-slate-200 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs font-bold text-slate-900">
                TOEFL Learning Companion — Longman Complete Course
              </div>
              <div className="text-[11px] text-slate-500 hidden sm:block">
                Deborah Phillips (2001) • Paper-Based (PBT) & Computer-Based (CBT) Curriculum
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModule('checklist')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <ListChecks className="w-3.5 h-3.5 text-indigo-600" />
              116 Skills Audit
            </button>
            <button
              onClick={() => setActiveModule('tutor')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Tanya Tutor AI
            </button>
          </div>
        </header>

        {/* Module Workspace */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
          {activeModule === 'dashboard' && (
            <DashboardModule
              progress={progress}
              mistakes={mistakes}
              onNavigate={(mod) => setActiveModule(mod)}
              onSelectSkill={handleSelectSkill}
            />
          )}

          {activeModule === 'fundamentals' && (
            <FundamentalsModule onNavigate={(mod) => setActiveModule(mod)} />
          )}

          {activeModule === 'listening' && (
            <ListeningModule
              activeSkillNum={activeListeningSkill}
              setActiveSkillNum={setActiveListeningSkill}
              masteredSkills={progress.listeningMastered}
              onToggleMastered={(num) => toggleSkillMastered('listeningMastered', num)}
              onRecordAnswer={handleRecordAnswer}
              onAskTutor={handleAskTutor}
            />
          )}

          {activeModule === 'structure' && (
            <StructureModule
              activeSkillNum={activeStructureSkill}
              setActiveSkillNum={setActiveStructureSkill}
              masteredSkills={progress.structureMastered}
              onToggleMastered={(num) => toggleSkillMastered('structureMastered', num)}
              onRecordAnswer={handleRecordAnswer}
              onAskTutor={handleAskTutor}
            />
          )}

          {activeModule === 'reading' && (
            <ReadingModule
              activeSkillNum={activeReadingSkill}
              setActiveSkillNum={setActiveReadingSkill}
              masteredSkills={progress.readingMastered}
              onToggleMastered={(num) => toggleSkillMastered('readingMastered', num)}
              onRecordAnswer={handleRecordAnswer}
            />
          )}

          {activeModule === 'writing' && (
            <WritingModule
              masteredSkills={progress.writingMastered}
              onToggleMastered={(num) => toggleSkillMastered('writingMastered', num)}
            />
          )}

          {activeModule === 'appendix' && (
            <AppendixModule
              memorizedCards={progress.memorizedCards}
              onToggleMemorized={toggleMemorizedCard}
            />
          )}

          {activeModule === 'practice' && (
            <PracticeCenterModule
              mistakes={mistakes}
              onRecordAnswer={handleRecordAnswer}
              onNavigate={(mod) => setActiveModule(mod)}
            />
          )}

          {activeModule === 'diagnostic' && (
            <DiagnosticModule
              onRecordAnswer={handleRecordAnswer}
              onNavigate={(mod) => setActiveModule(mod)}
            />
          )}

          {activeModule === 'mistakes' && (
            <MistakesModule
              mistakes={mistakes}
              onClearMistakes={() => setMistakes([])}
              onSelectSkill={handleSelectSkill}
            />
          )}

          {activeModule === 'studyplan' && (
            <StudyPlanModule
              progress={progress}
              mistakes={mistakes}
              onNavigate={(mod) => setActiveModule(mod)}
              onSelectSkill={handleSelectSkill}
            />
          )}

          {activeModule === 'tutor' && (
            <VirtualTutorModule
              initialPrompt={tutorPrompt}
              onClearInitialPrompt={() => setTutorPrompt('')}
              contextSummary={contextSummary}
            />
          )}

          {activeModule === 'checklist' && (
            <CoverageChecklistModule
              progress={progress}
              onSelectSkill={handleSelectSkill}
              onNavigate={(mod) => setActiveModule(mod)}
            />
          )}
        </main>
      </div>
    </div>
  );
}