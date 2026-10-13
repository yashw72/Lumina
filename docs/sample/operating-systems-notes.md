# Operating Systems: Concurrency, Synchronization & Deadlocks

## 1. Concurrency and Multithreading
Modern operating systems enable concurrent execution of processes and threads to maximize CPU utilization and throughput. 
A **process** represents an independent executing program with its own dedicated memory address space, file descriptors, and security context.
A **thread**, or lightweight process, is the basic unit of CPU scheduling. Threads belonging to the same parent process share text, data, and open resources, but maintain independent thread execution contexts (program counter, registers, and stack).

## 2. The Critical Section Problem & Mutual Exclusion
When multiple concurrent threads access shared mutable data, a **race condition** can occur if execution timing affects the output.
To guarantee determinism, code accessing shared state must be protected inside a **critical section**. Any valid solution to the critical section problem must satisfy three criteria:
1. **Mutual Exclusion**: If process $P_i$ is executing in its critical section, no other processes can be executing in their critical sections.
2. **Progress**: If no process is executing in its critical section and some processes wish to enter, only those processes not executing in their remainder sections can participate in deciding who enters next.
3. **Bounded Waiting**: There must be a bound or limit on the number of times that other processes are allowed to enter their critical sections after a process has made a request to enter.

Classic synchronization primitives include **Mutex Locks**, **Semaphores** (counting and binary), and language-level **Monitors**.

## 3. Deadlock Characterization
A **deadlock** is a state in which two or more concurrent processes are blocked forever because each holds resources that the other requires.
Four conditions must hold simultaneously for a deadlock to arise (Coffman Conditions):
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process must concurrently hold at least one resource while waiting to acquire additional resources held by other processes.
3. **No Preemption**: Resources cannot be preempted; they can only be released voluntarily by the process holding them after completion.
4. **Circular Wait**: A closed chain of processes $\{P_0, P_1, \dots, P_n\}$ exists where $P_0$ waits for a resource held by $P_1$, $P_1$ waits for $P_2$, and $P_n$ waits for $P_0$.

## 4. Deadlock Handling Strategies
1. **Deadlock Prevention**: Structural policies that invalidate at least one of the four Coffman conditions (e.g., resource ordering protocols to eliminate circular wait).
2. **Deadlock Avoidance**: Dynamic verification of system state using algorithms such as Dijkstra's **Banker's Algorithm**, ensuring the system never enters an unsafe state.
3. **Deadlock Detection and Recovery**: Periodic execution of wait-for graph cycle detection, followed by recovery actions such as process termination or resource preemption with rollback.
4. **Ostrich Algorithm**: Ignoring the problem entirely when deadlocks occur rarely and prevention overhead is prohibitive.
