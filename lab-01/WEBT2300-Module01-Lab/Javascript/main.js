// Create grades map with constructor
const grades = new Map([['A',4], ['B',3], ['C',2], ['D',1], ['F',0]]);
console.log(grades)

// Create gpa and gradesArr for calculating gpa
let gpa = 0;
let gradesArr = [];

// Start while loop
while (true) {
    // Ask user to enter a grade each time the loop restarts
    let userInput = prompt("Enter a grade or type done to finish:  ");

    // If the user's input is any variation of the word 'done' then we break out of the while loop
    if (userInput.toLowerCase() === 'done') {
        break;
    }

    /* Checking to see if the userinput is a valid grade letter.
        If the grade letter is valid then we push the grade letters value to the grades array for calculation.
    */
    if (!grades.has(userInput)) {
        alert("Invalid grade. Please enter a valid grade letter (A - F).")
    } else {
        gradesArr.push(grades.get(userInput));
    }
}

// for loop for calculating gpa
for (i = 0; i < gradesArr.length; i++) {
    gpa += gradesArr[i] / gradesArr.length
}


// logs gpa to console
console.log("Your calculated gpa is: " + gpa.toFixed(2))