# Pokédex Web

Projeto desenvolvido para a disciplina de Programação Web 2, sob orientação do prof. Josino Neto.

**Curso:** Tecnologia em Análise e Desenvolvimento de Sistemas  
**Instituição:** IFPE — Campus Jaboatão dos Guararapes  
**Estudante:** Eduardo Felipe Oliveira  
**Semestre:** 1º semestre de 2026  

---

## O que o projeto faz

Aplicação web que consome a [PokéAPI](https://pokeapi.co/) para listar, buscar e explorar Pokémons. As principais funcionalidades são:

- Listagem paginada com 20 Pokémons por página
- Busca por nome com feedback de erro
- Modal com detalhes do Pokémon: tipo, altura e peso
- Sistema de favoritos com persistência via localStorage

## Tecnologias utilizadas

- HTML5
- CSS3 (Flexbox, variáveis CSS, responsividade)
- JavaScript (Fetch API, Promise.all, manipulação do DOM)
- PokéAPI — https://pokeapi.co/

## Como rodar localmente

Não há dependências ou etapas de build. Basta clonar o repositório e abrir o arquivo no navegador.

```bash
git clone https://github.com/eduardofsantana/pokedex-web.git
cd pokedex-web
```

Abra o arquivo `index.html` diretamente no navegador, ou use a extensão **Live Server** no VS Code para evitar restrições de CORS.

## Acesso online

https://eduardofsantana.github.io/pokedex-web/

## Estrutura do projeto

```` pokedex-web/
├── index.html — estrutura da página
├── style.css — estilização e responsividade
└── script.js — lógica da aplicação e consumo da API 
