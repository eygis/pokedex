import './App.css';
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }
  searchFuncton = (e) => {
    e.preventDefault()
    let name = document.getElementById("searchInput").value;
    const getData = async () => {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + name)
      const data = await res.json()
      this.setState(data)
      //console.log(this.state)
    }
    getData()
    document.getElementById("searchForm").reset();
  }
  
  render() {
  
    let nameFunction = (value) => {
      if (!value.name) {
        return null;
      } else {
        return value.name[0].toUpperCase() + value.name.substring(1);
      }
    }

    let pictureFunction = (value) => {
      if (!value.sprites) {
        return null;
      } else {
        return value.sprites.other["official-artwork"].front_default
      }
    }

    let genFunction = (value) => {
      let name = nameFunction(value)
      if (!value["game_indices"]) {
        return null;
      } else {
          try {
        switch(value["game_indices"][0].version.name) {
          case "red":
          return name + " first appeared in Generation I."
          case "gold":
          return name + " first appeared in Generation II."
          case "ruby":
          return name + " first appeared in Generation III."
          case "diamond":
          return name + " first appeared in Generation IV."
          case "black":
          return name + " first appeared in Generation V."
          case "x":
          return name + " first appeared in Generation VI."
          case "sun":
          return name + " first appeared in Generation VII."
          case "sword":
          return name + " first appeared in Generation VIII."
          default:
          return null
        } 
      } catch (err) {
        console.error(err)
      }
    }
    }

    let typeFunction = (value) => {
      let type = "";
      let name = nameFunction(value)
      if (!value.types) {
        return null;
      }
      else if (value.types.length === 1) {
        type = value.types[0].type.name[0].toUpperCase() + value.types[0].type.name.substring(1);
        if (value.types[0].type.name[0] === "a"||
            value.types[0].type.name[0] === "e"||
            value.types[0].type.name[0] === "i"||
            value.types[0].type.name[0] === "o"||
            value.types[0].type.name[0] === "u") {
          return name + " is an " + type + " type Pokémon. "
        } else {
          return name + " is a " + type + " type Pokémon. "
        }
      }
      else if (value.types.length === 2) {
        type = value.types[0].type.name[0].toUpperCase() + value.types[0].type.name.substring(1) + "/" + value.types[1].type.name[0].toUpperCase() + value.types[1].type.name.substring(1);
        if (value.types[0].type.name[0] === "a"||
          value.types[0].type.name[0] === "e"||
          value.types[0].type.name[0] === "i"||
          value.types[0].type.name[0] === "o"||
          value.types[0].type.name[0] === "u") {
          return name + " is an " + type + " type Pokémon. "
        } else {
          return name + " is a " + type + " type Pokémon. "
        }
      }
    }
    
    let evolutionFunction = (value) => {
      if (!value.species) {
        return null
      } else {
      let id = value.id;
      const getData = async () => {
        const resone = await fetch("https://pokeapi.co/api/v2/pokemon-species/" + id)
        const dataone = await resone.json()
        if (dataone["evolves_from_species"] === null) {
        const chain = dataone["evolution_chain"].url;
        //console.log(chain)
        const restwo = await fetch(chain)
        const datatwo = await restwo.json()
        try { 
        console.log(this.state.name + " evolves to " + datatwo.chain["evolves_to"][0].species.name + ".")
        } catch (err) {
          console.log(this.state.name + " is not known to evolve.")
        }
        } else {
          const chain = dataone["evolution_chain"].url;
          const restwo = await fetch(chain)
          const datatwo = await restwo.json()
          if (datatwo.chain["evolves_to"][0]["evolves_to"].length === 0) {
            console.log(this.state.name + " evolves from " + datatwo.chain.species.name + ".")
          }
          else if (this.state.name !== datatwo.chain["evolves_to"][0]["evolves_to"][0].species.name) {
            console.log(this.state.name + " evolves to " + datatwo.chain["evolves_to"][0]["evolves_to"][0].species.name + ".")
          } else {
            console.log(this.state.name + " evolves from " + datatwo.chain["evolves_to"][0].species.name + ".")
          }
        }
      }
      getData()
    }
    }
     

    return (
    <div className="App">
      <div id="banner">
      <h1><img src="https://fontmeme.com/permalink/211104/a930b2e32421ad097d5a5dcdedaa93f0.png" alt="pokemon-title" /></h1>
      </div>
      <div id="content">
        <form id="searchForm" onSubmit={(e)=>this.searchFuncton(e)}>
          <input id="searchInput" type="text" placeholder="search for a Pokémon here!" />
          <button id="searchButton" type="submit">Search</button>
        </form>
        <Display 
          name={nameFunction(this.state)}
          picture={pictureFunction(this.state)}
          type={typeFunction(this.state)}
          generation={genFunction(this.state)}
          evolution={evolutionFunction(this.state)}
          />
      </div>
      <div id="footer">Pokémon and Pokémon character names are trademarks of Nintendo.</div>
    </div>
  );
}
}

class Display extends React.Component {

  render () {
    const { name, picture, type, generation} = this.props;
    
    return (
      <div id="display">
      <h1 id="pokemonName">{name}</h1>
      <p id="information"className="info">{type}{generation}</p>
      <img id="pokePicture" src={picture} alt={name} />
      </div>
    )
  }
}

export default App;