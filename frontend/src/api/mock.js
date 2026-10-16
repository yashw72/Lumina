// Mock API dataset and simulation layer

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

let mockDocuments = [];

let nextDocId = 1;

const mockChatSessions = {};

export const mockApi = {
  // Documents
  async listDocuments() {
    await delay(350);
    return { documents: [...mockDocuments] };
  },

  async uploadDocument(file, onProgress) {
    if (onProgress) {
      for (let p = 10; p <= 90; p += 25) {
        onProgress(p);
        await delay(120);
      }
      onProgress(100);
    }
    await delay(600); // Simulate processing/embedding time

    const extension = file.name.split('.').pop().toLowerCase();
    const newDoc = {
      id: nextDocId++,
      filename: file.name,
      file_type: extension,
      page_count: Math.floor(Math.random() * 12) + 2,
      chunk_count: Math.floor(Math.random() * 40) + 8,
      status: 'ready',
      created_at: new Date().toISOString(),
    };
    mockDocuments.unshift(newDoc);
    return newDoc;
  },

  async deleteDocument(id) {
    await delay(300);
    mockDocuments = mockDocuments.filter((doc) => doc.id !== Number(id));
    return { message: 'Document deleted' };
  },

  // Chat
  async sendMessage({ question, document_ids, session_id }) {
    await delay(800);
    const sid = session_id || `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (!mockChatSessions[sid]) {
      mockChatSessions[sid] = [];
    }

    // Add user message to mock history
    const userMsg = {
      role: 'user',
      content: question,
      sources: [],
      created_at: new Date().toISOString(),
    };
    mockChatSessions[sid].push(userMsg);

    // Filter relevant mock documents
    const targetDocs = document_ids && document_ids.length > 0
      ? mockDocuments.filter((d) => document_ids.includes(d.id))
      : mockDocuments;

    const chosenDoc = targetDocs[0] || mockDocuments[0] || {
      id: 1,
      filename: 'Operating-Systems-Concepts.pdf',
    };

    let answerText = '';
    let sources = [];

    const lowerQ = question.toLowerCase();
    if (lowerQ.includes('deadlock') || lowerQ.includes('process') || lowerQ.includes('operating')) {
      answerText = `### Understanding Deadlock & Resource Allocation\n\nBased on **${chosenDoc.filename}**, deadlock is a fundamental concurrency challenge where processes are permanently blocked.\n\nKey takeaways:\n- **Banker's Algorithm**: Used for deadlock avoidance by testing for safety by simulating the allocation of predetermined maximum possible amounts of all resources.\n- **Prevention vs. Avoidance**: Prevention eliminates one of the 4 Coffman conditions; Avoidance dynamically allocates resources if the system remains in a safe state.\n- **Recovery**: When detected, the system may abort processes or preempt resources.`;
      sources = [
        {
          document_id: chosenDoc.id,
          filename: chosenDoc.filename,
          page: 6,
          snippet:
            'A process requests resources; if the resources are not available at that time, the process enters a waiting state. Sometimes, a waiting process is never again able to change state, because the resources it has requested are held by other waiting processes.',
          score: 0.92,
        },
        {
          document_id: chosenDoc.id,
          filename: chosenDoc.filename,
          page: 8,
          snippet:
            'Resource-allocation graph: If graph contains no cycles, no deadlock exists. If graph contains cycles and only one instance per resource type, deadlock exists.',
          score: 0.85,
        },
      ];
    } else if (lowerQ.includes('network') || lowerQ.includes('tcp') || lowerQ.includes('osi')) {
      answerText = `### OSI & TCP/IP Model Fundamentals\n\nFrom the study notes in **${chosenDoc.filename}**:\n\n1. **Layer 4 (Transport)**: Handles end-to-end communication, reliability, and flow control (TCP) or low-latency transmission (UDP).\n2. **Three-Way Handshake**: SYN -> SYN-ACK -> ACK establishes a TCP connection.\n3. **Congestion Control**: Uses Slow Start, Congestion Avoidance, Fast Retransmit, and Fast Recovery.`;
      sources = [
        {
          document_id: chosenDoc.id,
          filename: chosenDoc.filename,
          page: 3,
          snippet:
            'The transport layer provides logical communication between process processes running on different hosts. TCP ensures reliable byte-stream transmission.',
          score: 0.89,
        },
      ];
    } else if (lowerQ.includes('unrelated') || lowerQ.includes('france') || lowerQ.includes('weather')) {
      answerText = 'I could not find information about that in the uploaded documents. My answers are strictly grounded in your study material.';
      sources = [];
    } else {
      answerText = `Here is what the document **${chosenDoc.filename}** explains regarding your question:\n\n- **Core Definition**: The concepts outlined in the study guide emphasize structured analysis and clear separation of concerns.\n- **Key Mechanism**: Standard mechanisms apply iterative verification to guarantee consistency across execution boundaries.\n\n*Reference: See section 3 of page 2 in the source document.*`;
      sources = [
        {
          document_id: chosenDoc.id,
          filename: chosenDoc.filename,
          page: 2,
          snippet: `Summary from ${chosenDoc.filename}: The fundamental architecture guarantees robust fault isolation while enabling high-throughput data processing across all modules.`,
          score: 0.84,
        },
      ];
    }

    let imageUrl = null;
    const trimmedQ = question.trim().toLowerCase();
    const bareWords = ['explain', 'explain.', 'explain!', 'describe', 'visualize', 'draw', 'diagram', 'image', '/image'];
    const isIncomplete =
      bareWords.includes(trimmedQ) ||
      trimmedQ.endsWith('illustrating') ||
      trimmedQ.endsWith('components of') ||
      trimmedQ.endsWith('process of');

    if (isIncomplete) {
      answerText =
        "Please specify what concept or topic you would like me to explain or visualize from your documents (for example: *'Explain the four Coffman conditions for deadlock'* or *'Draw a diagram of the TCP 3-way handshake'*).";
      sources = [];
      imageUrl = null;
    } else if (
      lowerQ.includes('image') ||
      lowerQ.includes('diagram') ||
      lowerQ.includes('draw') ||
      lowerQ.includes('visual') ||
      lowerQ.startsWith('/image')
    ) {
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(question)}?width=1024&height=768&nologo=true`;
      answerText = `Here is an educational visualization and explanation for **"${question}"**:\n\n${answerText}`;
    }

    const assistantMsg = {
      role: 'assistant',
      content: answerText,
      sources,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    };
    mockChatSessions[sid].push(assistantMsg);

    return {
      session_id: sid,
      answer: answerText,
      sources,
      image_url: imageUrl,
    };
  },

  async generateImage({ prompt, document_ids, session_id }) {
    await delay(700);
    const sid = session_id || `session-mock-${Date.now()}`;
    if (!mockChatSessions[sid]) {
      mockChatSessions[sid] = [];
    }

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&nologo=true`;
    const answerText = `### Visual Architecture Diagram: ${prompt}\n\nHere is an interactive conceptual diagram illustrating the primary components, interfaces, and operational flow.`;

    const assistantMsg = {
      role: 'assistant',
      content: answerText,
      sources: [],
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    };
    mockChatSessions[sid].push(assistantMsg);

    return {
      session_id: sid,
      answer: answerText,
      sources: [],
      image_url: imageUrl,
    };
  },

  async getHistory(session_id) {
    await delay(300);
    const messages = mockChatSessions[session_id] || [];
    return {
      session_id,
      messages,
    };
  },

  // Study Tools
  async getSummary(document_id) {
    await delay(900);
    const doc = mockDocuments.find((d) => d.id === Number(document_id)) || mockDocuments[0];
    return {
      document_id: Number(document_id),
      summary: `## Executive Study Summary: ${doc?.filename || 'Document'}

### 1. Key Objectives & Purpose
This document provides a comprehensive exploration of core computer science architectures and systems design principles. It balances theoretical frameworks with practical implementation guidelines.

### 2. Core Concepts
- **Concurrency & Resource Management**: Explains how modern systems isolate execution contexts, handle thread synchronization, and eliminate race conditions through mutual exclusion primitives.
- **Protocol Hierarchies**: Details multi-layer abstraction models, header encapsulation, error detection checksums, and window-based flow control.
- **Data Integrity & Consistency**: Outlines ACID properties, transactional isolation levels, and formal normalization steps (1NF through BCNF) to reduce redundancy.

### 3. Critical Theorems & Takeaways
> **Key Insight**: System design requires continuous trade-offs between latency, consistency, and resource overhead. Always verify system invariants before applying optimistic concurrency.

### 4. Recommended Review Topics for Exams
1. Identifying deadlock conditions and applying the Banker's algorithm.
2. Step-by-step TCP three-way handshake and connection teardown.
3. Functional dependencies and lossless decomposition proofs.`,
    };
  },

  async getFlashcards(document_id, count = 10) {
    await delay(800);
    const allCards = [
      {
        question: 'What are the four Coffman conditions required for deadlock?',
        answer: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait',
      },
      {
        question: 'What is the primary difference between Deadlock Prevention and Deadlock Avoidance?',
        answer: 'Prevention invalidates at least one of the 4 conditions beforehand; Avoidance dynamically evaluates resource requests to guarantee the system never enters an unsafe state.',
      },
      {
        question: 'What is the purpose of the TCP Three-Way Handshake?',
        answer: 'To synchronize sequence numbers (SYN, SYN-ACK, ACK) and allocate connection buffers on both client and server before data transfer begins.',
      },
      {
        question: 'What is the First Normal Form (1NF) requirement in relational databases?',
        answer: 'All column values must be atomic (indivisible) and each record must be unique with a designated primary key.',
      },
      {
        question: 'Explain Boyce-Codd Normal Form (BCNF).',
        answer: 'A stronger version of 3NF where for every non-trivial functional dependency X -> Y, X must be a superkey.',
      },
      {
        question: 'What is virtual memory and what problem does it solve?',
        answer: 'An abstraction mapping process virtual addresses to physical RAM, allowing execution of processes larger than physical memory while providing memory protection.',
      },
      {
        question: 'What is the difference between a process and a thread?',
        answer: 'A process has its own dedicated address space and resources. Threads share the same address space, code, and heap of their parent process while maintaining separate stacks.',
      },
      {
        question: 'What is the role of an Inode in a UNIX filesystem?',
        answer: 'An Inode stores file metadata (size, permissions, owner, timestamps) and pointers to disk blocks containing the actual file data, excluding the filename.',
      },
      {
        question: 'Why is DNS called a hierarchical, distributed database?',
        answer: 'Because name resolution is delegated across Root servers, Top-Level Domain (TLD) servers, and Authoritative servers without a single point of failure.',
      },
      {
        question: 'What is the difference between TCP and UDP?',
        answer: 'TCP is connection-oriented, reliable, and provides flow/congestion control; UDP is connectionless, lightweight, and prioritized for real-time, low-latency streaming.',
      },
      {
        question: 'What is a critical section and how is it protected?',
        answer: 'A piece of code accessing shared resources; protected by synchronization primitives like mutexes, semaphores, or monitor locks.',
      },
      {
        question: 'What is the Banker’s Algorithm primarily used for?',
        answer: 'Deadlock avoidance in multi-instance resource systems by simulating allocation safety.',
      },
      {
        question: 'What causes Thrashing in an operating system?',
        answer: 'When the system spends more time paging (swapping pages between RAM and disk) than executing instructions due to insufficient physical frames.',
      },
      {
        question: 'What is ACID in transaction management?',
        answer: 'Atomicity, Consistency, Isolation, and Durability - the four properties guaranteeing valid database transactions.',
      },
      {
        question: 'What is CSMA/CD in Ethernet networking?',
        answer: 'Carrier Sense Multiple Access with Collision Detection: nodes listen before transmitting and abort upon sensing collision.',
      },
    ];

    return {
      document_id: Number(document_id),
      flashcards: allCards.slice(0, Number(count) || 10),
    };
  },

  async getQuiz(document_id, count = 5) {
    await delay(800);
    const allQuiz = [
      {
        question: 'Which of the following is NOT one of the Coffman conditions for deadlock?',
        options: [
          'Mutual Exclusion',
          'Preemptive Scheduling',
          'Hold and Wait',
          'Circular Wait',
        ],
        correct_index: 1,
        explanation: 'The four conditions are Mutual Exclusion, Hold and Wait, NO Preemption, and Circular Wait. Preemption breaks deadlock.',
      },
      {
        question: 'In the TCP connection establishment protocol, what is the correct message order?',
        options: [
          'SYN -> ACK -> SYN-ACK',
          'SYN -> SYN-ACK -> ACK',
          'ACK -> SYN -> SYN-ACK',
          'SYN-ACK -> SYN -> ACK',
        ],
        correct_index: 1,
        explanation: 'TCP uses a 3-way handshake: Client sends SYN, Server responds with SYN-ACK, and Client acknowledges with ACK.',
      },
      {
        question: 'A relational table is in 2NF if it is in 1NF and:',
        options: [
          'Has no transitive dependencies',
          'Has no partial dependencies on any candidate key',
          'Every determinant is a superkey',
          'Contains no multi-valued attributes',
        ],
        correct_index: 1,
        explanation: '2NF requires eliminating partial functional dependencies where a non-prime attribute depends on only part of a composite candidate key.',
      },
      {
        question: 'What is the time complexity of searching in a Balanced Binary Search Tree (AVL / Red-Black)?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correct_index: 2,
        explanation: 'Because AVL and Red-Black trees maintain height bounded by log(n), search operations take O(log n) time.',
      },
      {
        question: 'Which page replacement algorithm suffers from Belady’s Anomaly?',
        options: [
          'FIFO (First-In, First-Out)',
          'LRU (Least Recently Used)',
          'Optimal Page Replacement',
          'LFU (Least Frequently Used)',
        ],
        correct_index: 0,
        explanation: 'Belady’s Anomaly describes the phenomenon where increasing page frames causes more page faults, which occurs in FIFO.',
      },
      {
        question: 'What layer of the OSI model does an IP router operate at?',
        options: [
          'Layer 2 (Data Link)',
          'Layer 3 (Network)',
          'Layer 4 (Transport)',
          'Layer 7 (Application)',
        ],
        correct_index: 1,
        explanation: 'Routers inspect IP packet headers and forward traffic at Layer 3 (Network Layer).',
      },
      {
        question: 'Which scheduling algorithm guarantees minimum average waiting time for a set of processes?',
        options: [
          'First-Come, First-Served (FCFS)',
          'Shortest Job First (SJF / SRTF)',
          'Round Robin (RR)',
          'Priority Scheduling',
        ],
        correct_index: 1,
        explanation: 'Shortest Job First is provably optimal with respect to minimum average waiting time.',
      },
      {
        question: 'In database systems, what does the "I" in ACID stand for?',
        options: ['Integrity', 'Indexing', 'Isolation', 'Idempotency'],
        correct_index: 2,
        explanation: 'Isolation ensures concurrent transactions execute without interfering with one another.',
      },
      {
        question: 'Which DNS record maps a domain name directly to an IPv4 address?',
        options: ['CNAME Record', 'AAAA Record', 'MX Record', 'A Record'],
        correct_index: 3,
        explanation: 'The A record maps a hostname to a 32-bit IPv4 address, whereas AAAA maps to IPv6.',
      },
      {
        question: 'What is the purpose of an Operating System Translation Lookaside Buffer (TLB)?',
        options: [
          'Disk cache for virtual page tables',
          'High-speed hardware cache for page-table lookups',
          'Buffer for inter-process socket communications',
          'Registry for active system call interrupts',
        ],
        correct_index: 1,
        explanation: 'The TLB is a fast hardware associative cache that stores recent virtual-to-physical address translations.',
      },
    ];

    return {
      document_id: Number(document_id),
      questions: allQuiz.slice(0, Number(count) || 5),
    };
  },
};
