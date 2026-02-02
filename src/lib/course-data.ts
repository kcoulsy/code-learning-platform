export interface Step {
  id: string
  title: string
  content: string // Markdown content
}

export interface Lesson {
  id: string
  title: string
  description: string
  type: "lesson"
  steps: Step[]
}

export interface Project {
  id: string
  title: string
  description: string
  type: "project"
  steps: Step[]
}

export type CourseItem = Lesson | Project

export interface Course {
  id: string
  title: string
  description: string
  items: CourseItem[]
}

// Sample course data - Learning C
export const courses: Course[] = [
  {
    id: "learning-c",
    title: "Learning C",
    description: "Master the fundamentals of C programming from the ground up",
    items: [
      {
        id: "intro-to-c",
        title: "Introduction to C",
        description: "Get started with the C programming language",
        type: "lesson",
        steps: [
          {
            id: "what-is-c",
            title: "What is C?",
            content: `# What is C?

C is a **general-purpose programming language** created by Dennis Ritchie at Bell Labs in the early 1970s. It has been one of the most influential languages in computer science history.

## Why Learn C?

- **Foundation of modern programming**: Many languages like C++, Java, and Python have syntax inspired by C
- **System programming**: Operating systems, embedded systems, and device drivers are often written in C
- **Performance**: C gives you low-level access to memory and hardware
- **Portability**: C code can run on almost any platform

## Key Characteristics

\`\`\`c
// C is a compiled language
// This is a simple C program

#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

C is known for being:
- **Fast** - compiles to machine code
- **Flexible** - low-level memory access
- **Portable** - runs on many platforms`,
          },
          {
            id: "setting-up",
            title: "Setting Up Your Environment",
            content: `# Setting Up Your C Development Environment

Before you can start writing C programs, you need to set up your development environment.

## What You Need

1. **A C Compiler** - Converts your code to machine-executable programs
2. **A Text Editor or IDE** - Where you write your code
3. **Terminal/Command Line** - To compile and run programs

## Popular Compilers

### GCC (GNU Compiler Collection)
The most widely used C compiler, available on Linux, macOS, and Windows.

\`\`\`bash
# Check if GCC is installed
gcc --version

# Compile a C program
gcc -o myprogram myprogram.c

# Run the program
./myprogram
\`\`\`

### Clang
A modern compiler with excellent error messages.

\`\`\`bash
clang -o myprogram myprogram.c
\`\`\`

## Recommended IDEs

- **VS Code** with C/C++ extension
- **CLion** (JetBrains)
- **Code::Blocks** (free, beginner-friendly)`,
          },
          {
            id: "first-program",
            title: "Your First C Program",
            content: `# Your First C Program

Let's write the classic "Hello, World!" program and understand each part.

## The Code

\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

## Breaking It Down

### \`#include <stdio.h>\`
This is a **preprocessor directive** that includes the Standard Input/Output library. This gives us access to functions like \`printf()\`.

### \`int main()\`
Every C program must have a \`main()\` function. This is where program execution begins.
- \`int\` means the function returns an integer
- \`main\` is the function name
- \`()\` contains parameters (empty here)

### \`printf("Hello, World!\\n");\`
This function prints text to the console.
- \`\\n\` is a newline character
- The semicolon \`;\` ends the statement

### \`return 0;\`
Returns 0 to indicate the program ran successfully.

## Try It Yourself

1. Create a file called \`hello.c\`
2. Type the code above
3. Compile: \`gcc -o hello hello.c\`
4. Run: \`./hello\``,
          },
        ],
      },
      {
        id: "variables-data-types",
        title: "Variables and Data Types",
        description: "Learn about storing and manipulating data in C",
        type: "lesson",
        steps: [
          {
            id: "what-are-variables",
            title: "What are Variables?",
            content: `# What are Variables?

A **variable** is a named storage location in memory that holds a value. Think of it as a labeled box where you can store data.

## Declaring Variables

In C, you must declare a variable before using it:

\`\`\`c
// Syntax: type name;
int age;
float price;
char letter;
\`\`\`

## Initializing Variables

You can give a variable an initial value:

\`\`\`c
// Declaration with initialization
int age = 25;
float price = 19.99;
char grade = 'A';
\`\`\`

## Variable Naming Rules

- Must start with a letter or underscore
- Can contain letters, digits, and underscores
- Cannot use reserved keywords (\`int\`, \`return\`, etc.)
- Case-sensitive (\`Age\` and \`age\` are different)

\`\`\`c
// Good variable names
int studentCount;
float total_price;
char _initial;

// Bad variable names
// int 2ndPlace;    // Can't start with number
// float my-price;  // Can't use hyphens
// int return;      // Can't use keywords
\`\`\``,
          },
          {
            id: "basic-data-types",
            title: "Basic Data Types",
            content: `# Basic Data Types in C

C has several fundamental data types for storing different kinds of values.

## Integer Types

\`\`\`c
int number = 42;           // Standard integer
short small = 100;         // Smaller integer
long big = 1000000L;       // Larger integer
long long huge = 9223372036854775807LL; // Very large
\`\`\`

## Floating-Point Types

\`\`\`c
float price = 19.99f;      // Single precision (6-7 digits)
double precise = 3.14159265358979; // Double precision (15-16 digits)
\`\`\`

## Character Type

\`\`\`c
char letter = 'A';         // Single character
char newline = '\\n';       // Escape character
\`\`\`

## Size of Data Types

Use \`sizeof()\` to check the size in bytes:

\`\`\`c
#include <stdio.h>

int main() {
    printf("int: %lu bytes\\n", sizeof(int));
    printf("float: %lu bytes\\n", sizeof(float));
    printf("double: %lu bytes\\n", sizeof(double));
    printf("char: %lu bytes\\n", sizeof(char));
    return 0;
}
\`\`\`

## Type Modifiers

- \`signed\` - can hold negative values (default for int)
- \`unsigned\` - only positive values, doubles the range

\`\`\`c
unsigned int positive = 4294967295; // 0 to 4,294,967,295
signed int any = -2147483648;       // -2,147,483,648 to 2,147,483,647
\`\`\``,
          },
          {
            id: "type-conversion",
            title: "Type Conversion",
            content: `# Type Conversion in C

Sometimes you need to convert data from one type to another.

## Implicit Conversion (Automatic)

C automatically converts compatible types:

\`\`\`c
int a = 10;
float b = a;      // int automatically converted to float
// b is now 10.0

double c = 5.5;
int d = c;        // double to int (loses decimal part!)
// d is now 5
\`\`\`

## Explicit Conversion (Casting)

Use casting when you need to force a conversion:

\`\`\`c
int total = 17;
int count = 5;

// Without casting - integer division
float avg1 = total / count;     // Result: 3.0 (wrong!)

// With casting - proper division
float avg2 = (float)total / count;  // Result: 3.4 (correct!)
\`\`\`

## Common Casting Examples

\`\`\`c
#include <stdio.h>

int main() {
    // Integer to character (ASCII)
    int num = 65;
    char letter = (char)num;
    printf("%c\\n", letter);  // Prints: A

    // Character to integer
    char ch = 'Z';
    int ascii = (int)ch;
    printf("%d\\n", ascii);   // Prints: 90

    // Float precision
    float f = 3.14159f;
    int truncated = (int)f;
    printf("%d\\n", truncated); // Prints: 3

    return 0;
}
\`\`\`

## Warning: Data Loss

Be careful when converting from larger to smaller types:

\`\`\`c
long big = 3000000000L;
int small = (int)big;  // May cause overflow!
\`\`\``,
          },
        ],
      },
      {
        id: "control-flow",
        title: "Control Flow",
        description: "Master conditional statements and loops",
        type: "lesson",
        steps: [
          {
            id: "if-statements",
            title: "If Statements",
            content: `# If Statements

If statements let your program make decisions based on conditions.

## Basic If Statement

\`\`\`c
int age = 18;

if (age >= 18) {
    printf("You are an adult\\n");
}
\`\`\`

## If-Else

\`\`\`c
int score = 75;

if (score >= 60) {
    printf("You passed!\\n");
} else {
    printf("You failed.\\n");
}
\`\`\`

## If-Else If-Else

\`\`\`c
int grade = 85;

if (grade >= 90) {
    printf("A\\n");
} else if (grade >= 80) {
    printf("B\\n");
} else if (grade >= 70) {
    printf("C\\n");
} else if (grade >= 60) {
    printf("D\\n");
} else {
    printf("F\\n");
}
\`\`\`

## Comparison Operators

| Operator | Meaning |
|----------|---------|
| \`==\` | Equal to |
| \`!=\` | Not equal to |
| \`>\` | Greater than |
| \`<\` | Less than |
| \`>=\` | Greater than or equal |
| \`<=\` | Less than or equal |

## Logical Operators

\`\`\`c
int age = 25;
int hasLicense = 1;  // 1 = true, 0 = false

// AND operator (&&)
if (age >= 18 && hasLicense) {
    printf("You can drive\\n");
}

// OR operator (||)
if (age < 13 || age > 65) {
    printf("Discounted ticket\\n");
}

// NOT operator (!)
if (!hasLicense) {
    printf("Please get a license\\n");
}
\`\`\``,
          },
          {
            id: "loops",
            title: "Loops",
            content: `# Loops in C

Loops allow you to repeat code multiple times.

## For Loop

Best when you know how many times to repeat:

\`\`\`c
// Print numbers 1 to 5
for (int i = 1; i <= 5; i++) {
    printf("%d\\n", i);
}
\`\`\`

**Structure:** \`for (initialization; condition; increment)\`

## While Loop

Best when the number of iterations is unknown:

\`\`\`c
int count = 0;

while (count < 5) {
    printf("Count: %d\\n", count);
    count++;
}
\`\`\`

## Do-While Loop

Always executes at least once:

\`\`\`c
int num;
do {
    printf("Enter a positive number: ");
    scanf("%d", &num);
} while (num <= 0);
\`\`\`

## Loop Control

### Break - Exit the loop immediately

\`\`\`c
for (int i = 0; i < 10; i++) {
    if (i == 5) {
        break;  // Exit when i reaches 5
    }
    printf("%d ", i);
}
// Output: 0 1 2 3 4
\`\`\`

### Continue - Skip to next iteration

\`\`\`c
for (int i = 0; i < 5; i++) {
    if (i == 2) {
        continue;  // Skip when i is 2
    }
    printf("%d ", i);
}
// Output: 0 1 3 4
\`\`\`

## Nested Loops

\`\`\`c
// Multiplication table
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        printf("%d x %d = %d\\n", i, j, i * j);
    }
}
\`\`\``,
          },
        ],
      },
      {
        id: "project-calculator",
        title: "Project: Simple Calculator",
        description: "Build a calculator using everything you've learned",
        type: "project",
        steps: [
          {
            id: "project-overview",
            title: "Project Overview",
            content: `# Project: Simple Calculator

Time to put your knowledge into practice! In this project, you'll build a simple calculator that can perform basic arithmetic operations.

## What You'll Build

A command-line calculator that:
- Takes two numbers as input
- Lets the user choose an operation (+, -, *, /)
- Displays the result
- Handles edge cases like division by zero

## Skills You'll Use

- Variables and data types
- User input with \`scanf()\`
- Conditional statements (if/else or switch)
- Basic arithmetic operations

## Expected Behavior

\`\`\`
Simple Calculator
================
Enter first number: 10
Enter second number: 5
Choose operation (+, -, *, /): *
Result: 10 * 5 = 50
\`\`\`

## Getting Started

Create a new file called \`calculator.c\` and start with this template:

\`\`\`c
#include <stdio.h>

int main() {
    // Your code here
    
    return 0;
}
\`\`\``,
          },
          {
            id: "project-implementation",
            title: "Implementation Guide",
            content: `# Implementation Guide

Let's build the calculator step by step.

## Step 1: Declare Variables

\`\`\`c
float num1, num2, result;
char operation;
\`\`\`

## Step 2: Get User Input

\`\`\`c
printf("Simple Calculator\\n");
printf("================\\n");

printf("Enter first number: ");
scanf("%f", &num1);

printf("Enter second number: ");
scanf("%f", &num2);

printf("Choose operation (+, -, *, /): ");
scanf(" %c", &operation);  // Note the space before %c
\`\`\`

## Step 3: Perform Calculation

You can use if-else or switch:

\`\`\`c
switch (operation) {
    case '+':
        result = num1 + num2;
        break;
    case '-':
        result = num1 - num2;
        break;
    case '*':
        result = num1 * num2;
        break;
    case '/':
        if (num2 != 0) {
            result = num1 / num2;
        } else {
            printf("Error: Division by zero!\\n");
            return 1;
        }
        break;
    default:
        printf("Error: Invalid operation!\\n");
        return 1;
}
\`\`\`

## Step 4: Display Result

\`\`\`c
printf("Result: %.2f %c %.2f = %.2f\\n", 
       num1, operation, num2, result);
\`\`\``,
          },
          {
            id: "project-complete",
            title: "Complete Solution",
            content: `# Complete Calculator Solution

Here's the full working code:

\`\`\`c
#include <stdio.h>

int main() {
    float num1, num2, result;
    char operation;

    printf("Simple Calculator\\n");
    printf("================\\n\\n");

    printf("Enter first number: ");
    scanf("%f", &num1);

    printf("Enter second number: ");
    scanf("%f", &num2);

    printf("Choose operation (+, -, *, /): ");
    scanf(" %c", &operation);

    switch (operation) {
        case '+':
            result = num1 + num2;
            break;
        case '-':
            result = num1 - num2;
            break;
        case '*':
            result = num1 * num2;
            break;
        case '/':
            if (num2 != 0) {
                result = num1 / num2;
            } else {
                printf("\\nError: Cannot divide by zero!\\n");
                return 1;
            }
            break;
        default:
            printf("\\nError: '%c' is not a valid operation!\\n", operation);
            return 1;
    }

    printf("\\nResult: %.2f %c %.2f = %.2f\\n", 
           num1, operation, num2, result);

    return 0;
}
\`\`\`

## Challenge Extensions

Try adding these features:
1. Loop to allow multiple calculations
2. Support for more operations (%, ^)
3. Memory feature to store previous result`,
          },
        ],
      },
      {
        id: "functions",
        title: "Functions",
        description: "Learn to organize code with reusable functions",
        type: "lesson",
        steps: [
          {
            id: "what-are-functions",
            title: "What are Functions?",
            content: `# What are Functions?

A **function** is a reusable block of code that performs a specific task. Functions help you:
- Organize your code into logical pieces
- Avoid repeating the same code
- Make your program easier to read and maintain

## Basic Function Structure

\`\`\`c
// Function declaration (prototype)
return_type function_name(parameters);

// Function definition
return_type function_name(parameters) {
    // function body
    return value;  // if not void
}
\`\`\`

## Your First Function

\`\`\`c
#include <stdio.h>

// Function that adds two numbers
int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(5, 3);
    printf("5 + 3 = %d\\n", result);  // Output: 5 + 3 = 8
    return 0;
}
\`\`\`

## Void Functions

Functions that don't return a value use \`void\`:

\`\`\`c
void greet(char name[]) {
    printf("Hello, %s!\\n", name);
    // No return statement needed
}

int main() {
    greet("Alice");  // Output: Hello, Alice!
    return 0;
}
\`\`\``,
          },
          {
            id: "function-parameters",
            title: "Function Parameters",
            content: `# Function Parameters

Parameters allow you to pass data into functions.

## Pass by Value

By default, C passes copies of values to functions:

\`\`\`c
void double_it(int x) {
    x = x * 2;
    printf("Inside function: %d\\n", x);
}

int main() {
    int num = 5;
    double_it(num);
    printf("Outside function: %d\\n", num);
    return 0;
}
// Output:
// Inside function: 10
// Outside function: 5  (unchanged!)
\`\`\`

## Pass by Reference (Pointers)

To modify the original value, use pointers:

\`\`\`c
void double_it(int *x) {
    *x = *x * 2;
}

int main() {
    int num = 5;
    double_it(&num);
    printf("After function: %d\\n", num);
    return 0;
}
// Output: After function: 10
\`\`\`

## Multiple Parameters

\`\`\`c
float calculate_average(int a, int b, int c) {
    return (a + b + c) / 3.0f;
}

int main() {
    float avg = calculate_average(10, 20, 30);
    printf("Average: %.2f\\n", avg);  // Output: 20.00
    return 0;
}
\`\`\``,
          },
        ],
      },
      {
        id: "pointers",
        title: "Pointers",
        description: "Understanding memory addresses and pointers",
        type: "lesson",
        steps: [
          {
            id: "intro-pointers",
            title: "Introduction to Pointers",
            content: `# Introduction to Pointers

A **pointer** is a variable that stores the memory address of another variable. Pointers are one of the most powerful features of C.

## Why Pointers?

- Direct memory access and manipulation
- Efficient passing of large data structures
- Dynamic memory allocation
- Building complex data structures (linked lists, trees)

## Basic Pointer Syntax

\`\`\`c
int x = 10;        // Regular variable
int *ptr = &x;     // Pointer to int, stores address of x

// & = "address of" operator
// * = "dereference" operator (get value at address)
\`\`\`

## Understanding Pointers

\`\`\`c
#include <stdio.h>

int main() {
    int num = 42;
    int *ptr = &num;

    printf("Value of num: %d\\n", num);
    printf("Address of num: %p\\n", (void*)&num);
    printf("Value of ptr: %p\\n", (void*)ptr);
    printf("Value at ptr (*ptr): %d\\n", *ptr);

    return 0;
}
\`\`\`

**Output:**
\`\`\`
Value of num: 42
Address of num: 0x7ffd5e8c9a4c
Value of ptr: 0x7ffd5e8c9a4c
Value at ptr (*ptr): 42
\`\`\`

## Modifying Values Through Pointers

\`\`\`c
int value = 10;
int *ptr = &value;

*ptr = 20;  // Change value through pointer

printf("%d\\n", value);  // Output: 20
\`\`\``,
          },
          {
            id: "pointers-arrays",
            title: "Pointers and Arrays",
            content: `# Pointers and Arrays

In C, arrays and pointers are closely related. An array name is essentially a pointer to its first element.

## Array as Pointer

\`\`\`c
int arr[5] = {10, 20, 30, 40, 50};

// These are equivalent:
printf("%d\\n", arr[0]);     // 10
printf("%d\\n", *arr);       // 10

printf("%d\\n", arr[2]);     // 30
printf("%d\\n", *(arr + 2)); // 30
\`\`\`

## Pointer Arithmetic

\`\`\`c
int arr[5] = {10, 20, 30, 40, 50};
int *ptr = arr;  // Points to first element

printf("%d\\n", *ptr);       // 10
printf("%d\\n", *(ptr + 1)); // 20
printf("%d\\n", *(ptr + 2)); // 30

ptr++;  // Move to next element
printf("%d\\n", *ptr);       // 20
\`\`\`

## Iterating with Pointers

\`\`\`c
int arr[5] = {10, 20, 30, 40, 50};
int *ptr = arr;
int *end = arr + 5;

while (ptr < end) {
    printf("%d ", *ptr);
    ptr++;
}
// Output: 10 20 30 40 50
\`\`\`

## Passing Arrays to Functions

\`\`\`c
// These function declarations are equivalent:
void printArray(int arr[], int size);
void printArray(int *arr, int size);

void printArray(int *arr, int size) {
    for (int i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
}

int main() {
    int numbers[5] = {1, 2, 3, 4, 5};
    printArray(numbers, 5);
    return 0;
}
\`\`\``,
          },
        ],
      },
    ],
  },
]

export function getCourse(courseId: string): Course | undefined {
  return courses.find((c) => c.id === courseId)
}

export function getCourseItem(
  courseId: string,
  itemId: string
): CourseItem | undefined {
  const course = getCourse(courseId)
  return course?.items.find((item) => item.id === itemId)
}

export function getStep(
  courseId: string,
  itemId: string,
  stepId: string
): Step | undefined {
  const item = getCourseItem(courseId, itemId)
  return item?.steps.find((step) => step.id === stepId)
}
