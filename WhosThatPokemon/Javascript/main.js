$(document).ready(() => {
    let pokemonName ;
    let pokemonImage;
    let score = 0;
    let count = 0;

    $('#guess-button').on("click", ( ) => {
        checkGuess();
    })

    function getPokemon() {
        let random = Math.floor(Math.random() * (151 + 1))
        $('#answer').text("Who's that Pokemon?")
        random = random == 0 ? 1 : random
        $(document).load("https://pokeapi.co/api/v2/pokemon/" + random, (response) => {
            data = JSON.parse(response)
            console.log(data)
            pokemonImage = data.sprites.front_default;
            pokemonName = data.species.name;
            console.log(pokemonImage)
            $('#pokemon-image').attr("src", pokemonImage)
            $('#pokemon-image').css("filter","blur(4px) brightness(0%)")
        })
        
    }

    getPokemon();

    function resolve2Seconds() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('resolved')
            }, 2000)
        })
    }

    async function checkGuess() {
       $("#pokemon-image").css("filter", "brightness(100%)")
       count++;
        if(pokemonName.toLowerCase() == $("#name").val().toLowerCase()) {
            $('#answer').text("Correct the pokemon is: " + pokemonName)
            score++;
        } else {
            $('#answer').text("Incorrect the pokemon is: " + pokemonName)
        }
        $('#score').text(`Score: ${score}/${count}`)
        await resolve2Seconds().then(() => {
            getPokemon();
        });
    }
})
    

