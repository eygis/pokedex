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
      console.log(this.state.sprites.front_default)
    }
    getData()
    
  }
  
  render() {
  
  
    return (
    <div className="App">
      <div id="banner">
      <h1><a href="https://fontmeme.com/pokemon-font/"><img src="https://fontmeme.com/permalink/211104/a930b2e32421ad097d5a5dcdedaa93f0.png" alt="pokemon-title" /></a></h1>
      </div>
      <div id="content">
        <form id="searchForm" onSubmit={(e)=>this.searchFuncton(e)}>
          <input id="searchInput" type="text" placeholder="search for a Pokémon here!" />
          <button id="searchButton" type="submit">Search</button>
        </form>
        <Display 
          name={this.state.name}
          picture={this.state.sprites.front_default}
          />
      </div>
      <div id="footer">Pokémon and Pokémon character names are trademarks of Nintendo.</div>
    </div>
  );
}
}

class Display extends React.Component {

  render () {
    const { name, picture } = this.props;
    
    return (
      <div id="display">
      <img src={picture} />
      <p>{name}</p>
      </div>
    )
  }
}

export default App;