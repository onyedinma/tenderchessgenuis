// Main JavaScript file for Chess Quiz Application

// Initialize chessboard if it exists on the page
document.addEventListener('DOMContentLoaded', function() {
    const boardElement = document.getElementById('chessboard');
    
    if (boardElement) {
        // Default position - can be overridden by specific pages
        const position = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        
        // Initialize the board
        const board = Chessboard(boardElement.id, {
            position: position,
            draggable: true,
            dropOffBoard: 'snapback',
            sparePieces: false
        });
        
        // Make board responsive
        window.addEventListener('resize', board.resize);
    }
});

// Timer functionality
function startTimer(duration, displayElement) {
    if (!displayElement) return;
    
    let timer = duration;
    let minutes, seconds;
    
    const interval = setInterval(function() {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        
        displayElement.textContent = minutes + ":" + seconds;
        
        if (--timer < 0) {
            clearInterval(interval);
            displayElement.textContent = "Time's up!";
            
            // Auto-submit if a form exists
            const quizForm = document.querySelector('form.quiz-form');
            if (quizForm) {
                quizForm.submit();
            }
        }
    }, 1000);
    
    return interval;
}

// Form validation
function validateForm(formElement) {
    if (!formElement) return true;
    
    let isValid = true;
    const requiredFields = formElement.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            
            const errorMsg = document.createElement('span');
            errorMsg.classList.add('error-message');
            errorMsg.textContent = 'This field is required';
            
            // Remove existing error message if any
            const existingError = field.nextElementSibling;
            if (existingError && existingError.classList.contains('error-message')) {
                existingError.remove();
            }
            
            field.parentNode.insertBefore(errorMsg, field.nextSibling);
        }
    });
    
    return isValid;
} 