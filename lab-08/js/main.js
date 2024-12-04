// I looked at this this morning because my kids were curious.
// It works if you do this inside the document ready function.
// Basically, the dom just doesn't have the element loaded at the time the function is called.



$(document).ready(function() {
    
    const myForm = $(".contact-form")
    myForm.on("submit", (event) => {
        event.preventDefault()
    
        const email = $("#email").val().trim()
    
        if (email.toLowerCase() == 'doug@yahoo.com' || 'doug@gmail.com' || 'doug@hotmai.com') {
            window.location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUJcmljayByb2xs")
    
        }
    });
});
