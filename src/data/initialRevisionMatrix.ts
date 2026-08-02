import { ChapterRevisionItem } from '@/types';

export const initialRevisionMatrix: ChapterRevisionItem[] = [
  // ==========================================
  // 1. GATE CS SUBJECTS & CHAPTERS
  // ==========================================
  // COMPUTER NETWORKS
  { id: 'cn_1', category: 'gate_cs', subject: 'COMPUTER NETWORKS', chapter: 'IPv4 Addressing', checkpoints: {} },
  { id: 'cn_2', category: 'gate_cs', subject: 'COMPUTER NETWORKS', chapter: 'Error Control', checkpoints: {} },
  { id: 'cn_3', category: 'gate_cs', subject: 'COMPUTER NETWORKS', chapter: 'Flow Control', checkpoints: {} },
  { id: 'cn_4', category: 'gate_cs', subject: 'COMPUTER NETWORKS', chapter: 'IPv4 Header & Fragmentation', checkpoints: {} },
  { id: 'cn_5', category: 'gate_cs', subject: 'COMPUTER NETWORKS', chapter: 'TCP & UDP', checkpoints: {} },
  { id: 'cn_6', category: 'gate_cs', subject: 'COMPUTER NETWORKS', chapter: 'Medium Access Control', checkpoints: {} },
  { id: 'cn_7', category: 'gate_cs', subject: 'COMPUTER NETWORKS', chapter: 'Routing Protocols', checkpoints: {} },
  { id: 'cn_8', category: 'gate_cs', subject: 'COMPUTER NETWORKS', chapter: 'Switching', checkpoints: {} },
  { id: 'cn_9', category: 'gate_cs', subject: 'COMPUTER NETWORKS', chapter: 'Application Layer Protocols', checkpoints: {} },
  { id: 'cn_10', category: 'gate_cs', subject: 'COMPUTER NETWORKS', chapter: 'IP Support Protocol', checkpoints: {} },
  { id: 'cn_11', category: 'gate_cs', subject: 'COMPUTER NETWORKS', chapter: 'OSI & TCP/Stack Protocol', checkpoints: {} },

  // OPERATING SYSTEMS
  { id: 'os_1', category: 'gate_cs', subject: 'OPERATING SYSTEMS', chapter: 'Introduction & Background', checkpoints: {} },
  { id: 'os_2', category: 'gate_cs', subject: 'OPERATING SYSTEMS', chapter: 'Process Management', checkpoints: {} },
  { id: 'os_3', category: 'gate_cs', subject: 'OPERATING SYSTEMS', chapter: 'CPU Scheduling', checkpoints: {} },
  { id: 'os_4', category: 'gate_cs', subject: 'OPERATING SYSTEMS', chapter: 'Process Synchronization', checkpoints: {} },
  { id: 'os_5', category: 'gate_cs', subject: 'OPERATING SYSTEMS', chapter: 'DeadLock', checkpoints: {} },
  { id: 'os_6', category: 'gate_cs', subject: 'OPERATING SYSTEMS', chapter: 'Memory Management', checkpoints: {} },
  { id: 'os_7', category: 'gate_cs', subject: 'OPERATING SYSTEMS', chapter: 'File System & Device Management', checkpoints: {} },
  { id: 'os_8', category: 'gate_cs', subject: 'OPERATING SYSTEMS', chapter: 'System Calls & Threads', checkpoints: {} },

  // C - PROGRAMMING
  { id: 'c_1', category: 'gate_cs', subject: 'C - PROGRAMMING', chapter: 'Data Types & Operators', checkpoints: {} },
  { id: 'c_2', category: 'gate_cs', subject: 'C - PROGRAMMING', chapter: 'Control Flow Statements', checkpoints: {} },
  { id: 'c_3', category: 'gate_cs', subject: 'C - PROGRAMMING', chapter: 'Functions & Storage Classes', checkpoints: {} },
  { id: 'c_4', category: 'gate_cs', subject: 'C - PROGRAMMING', chapter: 'Arrays & Pointers', checkpoints: {} },
  { id: 'c_5', category: 'gate_cs', subject: 'C - PROGRAMMING', chapter: 'Strings', checkpoints: {} },
  { id: 'c_6', category: 'gate_cs', subject: 'C - PROGRAMMING', chapter: 'Structures & Union', checkpoints: {} },
  { id: 'c_7', category: 'gate_cs', subject: 'C - PROGRAMMING', chapter: 'Miscellaneous Topics', checkpoints: {} },

  // DATA STRUCTURES
  { id: 'ds_1', category: 'gate_cs', subject: 'DATA STRUCTURES', chapter: 'Introduction', checkpoints: {} },
  { id: 'ds_2', category: 'gate_cs', subject: 'DATA STRUCTURES', chapter: 'Arrays', checkpoints: {} },
  { id: 'ds_3', category: 'gate_cs', subject: 'DATA STRUCTURES', chapter: 'Linked List', checkpoints: {} },
  { id: 'ds_4', category: 'gate_cs', subject: 'DATA STRUCTURES', chapter: 'Stack & Queues', checkpoints: {} },
  { id: 'ds_5', category: 'gate_cs', subject: 'DATA STRUCTURES', chapter: 'Trees', checkpoints: {} },
  { id: 'ds_6', category: 'gate_cs', subject: 'DATA STRUCTURES', chapter: 'Graphs', checkpoints: {} },
  { id: 'ds_7', category: 'gate_cs', subject: 'DATA STRUCTURES', chapter: 'Hashing', checkpoints: {} },

  // DIGITAL LOGIC
  { id: 'dl_1', category: 'gate_cs', subject: 'DIGITAL LOGIC', chapter: 'Logic Gates', checkpoints: {} },
  { id: 'dl_2', category: 'gate_cs', subject: 'DIGITAL LOGIC', chapter: 'Minimization', checkpoints: {} },
  { id: 'dl_3', category: 'gate_cs', subject: 'DIGITAL LOGIC', chapter: 'Combinational Circuit', checkpoints: {} },
  { id: 'dl_4', category: 'gate_cs', subject: 'DIGITAL LOGIC', chapter: 'Sequential Circuit', checkpoints: {} },
  { id: 'dl_5', category: 'gate_cs', subject: 'DIGITAL LOGIC', chapter: 'Number System', checkpoints: {} },

  // THEORY OF COMPUTATION
  { id: 'toc_1', category: 'gate_cs', subject: 'THEORY OF COMPUTATION', chapter: 'Finite Automata', checkpoints: {} },
  { id: 'toc_2', category: 'gate_cs', subject: 'THEORY OF COMPUTATION', chapter: 'Push Down Automata', checkpoints: {} },
  { id: 'toc_3', category: 'gate_cs', subject: 'THEORY OF COMPUTATION', chapter: 'Turing Machine Recursively Enumerable', checkpoints: {} },
  { id: 'toc_4', category: 'gate_cs', subject: 'THEORY OF COMPUTATION', chapter: 'Decidability', checkpoints: {} },

  // COMPILER DESIGN
  { id: 'cd_1', category: 'gate_cs', subject: 'COMPILER DESIGN', chapter: 'Lexical & Syntax Analysis', checkpoints: {} },
  { id: 'cd_2', category: 'gate_cs', subject: 'COMPILER DESIGN', chapter: 'Syntax Directed Translation', checkpoints: {} },
  { id: 'cd_3', category: 'gate_cs', subject: 'COMPILER DESIGN', chapter: 'Intermediate Code & Code Optimization', checkpoints: {} },

  // ALGORITHMS
  { id: 'algo_1', category: 'gate_cs', subject: 'ALGORITHMS', chapter: 'Analysis Of Algorithms', checkpoints: {} },
  { id: 'algo_2', category: 'gate_cs', subject: 'ALGORITHMS', chapter: 'Design Strategies', checkpoints: {} },
  { id: 'algo_3', category: 'gate_cs', subject: 'ALGORITHMS', chapter: 'Greedy Method', checkpoints: {} },
  { id: 'algo_4', category: 'gate_cs', subject: 'ALGORITHMS', chapter: 'Dynamic Programming', checkpoints: {} },
  { id: 'algo_5', category: 'gate_cs', subject: 'ALGORITHMS', chapter: 'Graph Algorithms', checkpoints: {} },
  { id: 'algo_6', category: 'gate_cs', subject: 'ALGORITHMS', chapter: 'Heap Algorithms', checkpoints: {} },
  { id: 'algo_7', category: 'gate_cs', subject: 'ALGORITHMS', chapter: 'Backtracking & Branch-Bound', checkpoints: {} },

  // DATABASE MANAGEMENT SYSTEM
  { id: 'dbms_1', category: 'gate_cs', subject: 'DATABASE MANAGEMENT SYSTEM', chapter: "FD's and Normalisation", checkpoints: {} },
  { id: 'dbms_2', category: 'gate_cs', subject: 'DATABASE MANAGEMENT SYSTEM', chapter: 'Transaction and Concurrency Control', checkpoints: {} },
  { id: 'dbms_3', category: 'gate_cs', subject: 'DATABASE MANAGEMENT SYSTEM', chapter: 'ER Model', checkpoints: {} },
  { id: 'dbms_4', category: 'gate_cs', subject: 'DATABASE MANAGEMENT SYSTEM', chapter: 'Query Language', checkpoints: {} },
  { id: 'dbms_5', category: 'gate_cs', subject: 'DATABASE MANAGEMENT SYSTEM', chapter: 'File Organisation & Indexing', checkpoints: {} },

  // COMPUTER ORGANISATION & ARCHITECTURE
  { id: 'coa_1', category: 'gate_cs', subject: 'COMPUTER ORGANISATION & ARCHITECTURE', chapter: 'Introduction Of COA', checkpoints: {} },
  { id: 'coa_2', category: 'gate_cs', subject: 'COMPUTER ORGANISATION & ARCHITECTURE', chapter: 'Machine Instruction and Addressing Modes', checkpoints: {} },
  { id: 'coa_3', category: 'gate_cs', subject: 'COMPUTER ORGANISATION & ARCHITECTURE', chapter: 'Floating Point Representation', checkpoints: {} },
  { id: 'coa_4', category: 'gate_cs', subject: 'COMPUTER ORGANISATION & ARCHITECTURE', chapter: 'ALU and Control Unit', checkpoints: {} },
  { id: 'coa_5', category: 'gate_cs', subject: 'COMPUTER ORGANISATION & ARCHITECTURE', chapter: 'Instruction And Pipelining', checkpoints: {} },
  { id: 'coa_6', category: 'gate_cs', subject: 'COMPUTER ORGANISATION & ARCHITECTURE', chapter: 'Cache Memory', checkpoints: {} },
  { id: 'coa_7', category: 'gate_cs', subject: 'COMPUTER ORGANISATION & ARCHITECTURE', chapter: 'Secondary Memory & IO Interface', checkpoints: {} },

  // DISCRETE MATHEMATICS
  { id: 'dm_1', category: 'gate_cs', subject: 'DISCRETE MATHEMATICS', chapter: 'Graph Theory', checkpoints: {} },
  { id: 'dm_2', category: 'gate_cs', subject: 'DISCRETE MATHEMATICS', chapter: 'Mathematical Logic', checkpoints: {} },
  { id: 'dm_3', category: 'gate_cs', subject: 'DISCRETE MATHEMATICS', chapter: 'Set Theory', checkpoints: {} },
  { id: 'dm_4', category: 'gate_cs', subject: 'DISCRETE MATHEMATICS', chapter: 'Combinatorics', checkpoints: {} },

  // ENGINEERING MATHEMATICS
  { id: 'em_1', category: 'gate_cs', subject: 'ENGINEERING MATHEMATICS', chapter: 'Linear Algebra', checkpoints: {} },
  { id: 'em_2', category: 'gate_cs', subject: 'ENGINEERING MATHEMATICS', chapter: 'Calculus', checkpoints: {} },
  { id: 'em_3', category: 'gate_cs', subject: 'ENGINEERING MATHEMATICS', chapter: 'Probability & Statistics', checkpoints: {} },

  // ==========================================
  // 2. GATE DA / AI SUBJECTS & CHAPTERS
  // ==========================================
  // PROBABILITY & STATISTICS (DA/AI)
  { id: 'da_ps_1', category: 'gate_da', subject: 'PROBABILITY & STATISTICS', chapter: 'Counting, Permutations & Combinations', checkpoints: {} },
  { id: 'da_ps_2', category: 'gate_da', subject: 'PROBABILITY & STATISTICS', chapter: 'Probability Axioms & Sample Space', checkpoints: {} },
  { id: 'da_ps_3', category: 'gate_da', subject: 'PROBABILITY & STATISTICS', chapter: 'Conditional Probability & Bayes Theorem', checkpoints: {} },
  { id: 'da_ps_4', category: 'gate_da', subject: 'PROBABILITY & STATISTICS', chapter: 'Random Variables & Probability Distributions', checkpoints: {} },
  { id: 'da_ps_5', category: 'gate_da', subject: 'PROBABILITY & STATISTICS', chapter: 'Expectation, Variance & Moments', checkpoints: {} },
  { id: 'da_ps_6', category: 'gate_da', subject: 'PROBABILITY & STATISTICS', chapter: 'Correlation & Linear Regression', checkpoints: {} },

  // LINEAR ALGEBRA (DA/AI)
  { id: 'da_la_1', category: 'gate_da', subject: 'LINEAR ALGEBRA', chapter: 'Vector Spaces & Subspaces', checkpoints: {} },
  { id: 'da_la_2', category: 'gate_da', subject: 'LINEAR ALGEBRA', chapter: 'Matrices, Determinants & Systems of Linear Equations', checkpoints: {} },
  { id: 'da_la_3', category: 'gate_da', subject: 'LINEAR ALGEBRA', chapter: 'Eigenvalues & Eigenvectors', checkpoints: {} },
  { id: 'da_la_4', category: 'gate_da', subject: 'LINEAR ALGEBRA', chapter: 'LU Decomposition & QR Factorization', checkpoints: {} },
  { id: 'da_la_5', category: 'gate_da', subject: 'LINEAR ALGEBRA', chapter: 'Singular Value Decomposition (SVD)', checkpoints: {} },
  { id: 'da_la_6', category: 'gate_da', subject: 'LINEAR ALGEBRA', chapter: 'Principal Component Analysis (PCA)', checkpoints: {} },

  // CALCULUS & OPTIMIZATION (DA/AI)
  { id: 'da_calc_1', category: 'gate_da', subject: 'CALCULUS & OPTIMIZATION', chapter: 'Functions of Single & Multiple Variables', checkpoints: {} },
  { id: 'da_calc_2', category: 'gate_da', subject: 'CALCULUS & OPTIMIZATION', chapter: 'Maxima, Minima & Saddle Points', checkpoints: {} },
  { id: 'da_calc_3', category: 'gate_da', subject: 'CALCULUS & OPTIMIZATION', chapter: 'Convex Functions & Optimization Bounds', checkpoints: {} },
  { id: 'da_calc_4', category: 'gate_da', subject: 'CALCULUS & OPTIMIZATION', chapter: 'Gradient Descent & Stochastic Gradient Descent', checkpoints: {} },

  // PROGRAMMING, DS & ALGORITHMS (DA/AI)
  { id: 'da_prog_1', category: 'gate_da', subject: 'PROGRAMMING, DS & ALGORITHMS', chapter: 'Python Core & Control Structures', checkpoints: {} },
  { id: 'da_prog_2', category: 'gate_da', subject: 'PROGRAMMING, DS & ALGORITHMS', chapter: 'Arrays, Linked Lists, Stacks & Queues', checkpoints: {} },
  { id: 'da_prog_3', category: 'gate_da', subject: 'PROGRAMMING, DS & ALGORITHMS', chapter: 'Trees & Binary Search Trees', checkpoints: {} },
  { id: 'da_prog_4', category: 'gate_da', subject: 'PROGRAMMING, DS & ALGORITHMS', chapter: 'Graph Algorithms (BFS/DFS/Shortest Path)', checkpoints: {} },
  { id: 'da_prog_5', category: 'gate_da', subject: 'PROGRAMMING, DS & ALGORITHMS', chapter: 'Searching, Sorting & Hashing Algorithms', checkpoints: {} },

  // DATABASE MANAGEMENT & WAREHOUSING (DA/AI)
  { id: 'da_db_1', category: 'gate_da', subject: 'DATABASE MANAGEMENT & WAREHOUSING', chapter: 'ER Model & Relational Database Design', checkpoints: {} },
  { id: 'da_db_2', category: 'gate_da', subject: 'DATABASE MANAGEMENT & WAREHOUSING', chapter: 'Relational Algebra & Advanced SQL Queries', checkpoints: {} },
  { id: 'da_db_3', category: 'gate_da', subject: 'DATABASE MANAGEMENT & WAREHOUSING', chapter: 'Normalization & Functional Dependencies', checkpoints: {} },
  { id: 'da_db_4', category: 'gate_da', subject: 'DATABASE MANAGEMENT & WAREHOUSING', chapter: 'File Organization, Indexing & B+ Trees', checkpoints: {} },

  // MACHINE LEARNING (DA/AI)
  { id: 'da_ml_1', category: 'gate_da', subject: 'MACHINE LEARNING', chapter: 'Supervised Learning: Linear & Logistic Regression', checkpoints: {} },
  { id: 'da_ml_2', category: 'gate_da', subject: 'MACHINE LEARNING', chapter: 'Decision Trees & Random Forests', checkpoints: {} },
  { id: 'da_ml_3', category: 'gate_da', subject: 'MACHINE LEARNING', chapter: 'Support Vector Machines (SVM) & Kernel Methods', checkpoints: {} },
  { id: 'da_ml_4', category: 'gate_da', subject: 'MACHINE LEARNING', chapter: 'k-Nearest Neighbors (k-NN) & Naive Bayes', checkpoints: {} },
  { id: 'da_ml_5', category: 'gate_da', subject: 'MACHINE LEARNING', chapter: 'Unsupervised Learning: K-Means & Hierarchical Clustering', checkpoints: {} },
  { id: 'da_ml_6', category: 'gate_da', subject: 'MACHINE LEARNING', chapter: 'Model Evaluation, Overfitting & Regularization (L1/L2)', checkpoints: {} },
  { id: 'da_ml_7', category: 'gate_da', subject: 'MACHINE LEARNING', chapter: 'Neural Networks & Deep Learning Intro', checkpoints: {} },

  // ARTIFICIAL INTELLIGENCE (DA/AI)
  { id: 'da_ai_1', category: 'gate_da', subject: 'ARTIFICIAL INTELLIGENCE', chapter: 'Uninformed & Informed Search (A* Search)', checkpoints: {} },
  { id: 'da_ai_2', category: 'gate_da', subject: 'ARTIFICIAL INTELLIGENCE', chapter: 'Adversarial Search, Minimax & Alpha-Beta Pruning', checkpoints: {} },
  { id: 'da_ai_3', category: 'gate_da', subject: 'ARTIFICIAL INTELLIGENCE', chapter: 'Propositional & First-Order Logic', checkpoints: {} },
  { id: 'da_ai_4', category: 'gate_da', subject: 'ARTIFICIAL INTELLIGENCE', chapter: 'Reasoning Under Uncertainty & Bayesian Networks', checkpoints: {} },

  // ==========================================
  // 3. GENERAL APTITUDE SUBJECTS & CHAPTERS
  // ==========================================
  { id: 'ga_1', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Averages', checkpoints: {} },
  { id: 'ga_2', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Percentages', checkpoints: {} },
  { id: 'ga_3', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Simple & Compound Interest', checkpoints: {} },
  { id: 'ga_4', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Profit and Loss', checkpoints: {} },
  { id: 'ga_5', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Mixtures & Alligations', checkpoints: {} },
  { id: 'ga_6', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Ratio and Proportion', checkpoints: {} },
  { id: 'ga_7', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Counting Theory', checkpoints: {} },
  { id: 'ga_8', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Time and Work', checkpoints: {} },
  { id: 'ga_9', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Pipes and Cisterns', checkpoints: {} },
  { id: 'ga_10', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Speed, Distance and Time', checkpoints: {} },
  { id: 'ga_11', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Boats, Trains, Races', checkpoints: {} },
  { id: 'ga_12', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Mensuration 2D, 3D', checkpoints: {} },
  { id: 'ga_13', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Geometry', checkpoints: {} },
  { id: 'ga_14', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Data Interpretation', checkpoints: {} },
  { id: 'ga_15', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Probability', checkpoints: {} },
  { id: 'ga_16', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Set Theory', checkpoints: {} },
  { id: 'ga_17', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Permutation & Combinations', checkpoints: {} },
  { id: 'ga_18', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Calendars', checkpoints: {} },
  { id: 'ga_19', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Clocks', checkpoints: {} },
  { id: 'ga_20', category: 'general_aptitude', subject: 'QUANTITATIVE APTITUDE', chapter: 'Number System', checkpoints: {} },

  { id: 'ga_21', category: 'general_aptitude', subject: 'REASONING & LOGICAL APTITUDE', chapter: 'Blood Relations', checkpoints: {} },
  { id: 'ga_22', category: 'general_aptitude', subject: 'REASONING & LOGICAL APTITUDE', chapter: 'Coding & Decoding', checkpoints: {} },
  { id: 'ga_23', category: 'general_aptitude', subject: 'REASONING & LOGICAL APTITUDE', chapter: 'Directions', checkpoints: {} },
  { id: 'ga_24', category: 'general_aptitude', subject: 'REASONING & LOGICAL APTITUDE', chapter: 'Arrangements and Rankings', checkpoints: {} },
  { id: 'ga_25', category: 'general_aptitude', subject: 'REASONING & LOGICAL APTITUDE', chapter: 'Cubes & Dices', checkpoints: {} },
  { id: 'ga_26', category: 'general_aptitude', subject: 'REASONING & LOGICAL APTITUDE', chapter: 'Venn Diagrams', checkpoints: {} },
  { id: 'ga_27', category: 'general_aptitude', subject: 'REASONING & LOGICAL APTITUDE', chapter: 'Paper Folding', checkpoints: {} },
  { id: 'ga_28', category: 'general_aptitude', subject: 'REASONING & LOGICAL APTITUDE', chapter: 'Image Formations', checkpoints: {} },
];
