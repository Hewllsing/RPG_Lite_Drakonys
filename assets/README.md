# Dark Fantasy Asset Pack

Pack base organizado para um RPG 2D dark fantasy com identidade visual inspirada por `Diablo 2 Resurrected`, `Path of Exile`, `Last Epoch` e `Grim Dawn`.

## Estrutura

- `assets/classes/`
- `assets/monsters/`
- `assets/bosses/`
- `assets/items/`
- `assets/ui/`
- `assets/tilesets/`
- `assets/npcs/`

## Lote Gerado

Os primeiros assets reais exportados em PNG transparente neste workspace foram:

- [warrior portrait](</C:/Rafael Pessoal/Jogos/Drakonys/RPG_Lite_Drakonys/assets/classes/warrior/portrait.png>)
- [mage portrait](</C:/Rafael Pessoal/Jogos/Drakonys/RPG_Lite_Drakonys/assets/classes/mage/portrait.png>)
- [archer portrait](</C:/Rafael Pessoal/Jogos/Drakonys/RPG_Lite_Drakonys/assets/classes/archer/portrait.png>)

As fontes com chroma key usadas para recorte local ficaram em `assets/_generated_sources/`.

## Observacao Tecnica

O fluxo built-in com chroma key funciona bem para retratos mais fechados, mas nao e o caminho ideal para um pack inteiro com:

- transparencia nativa em cabelo, tecido rasgado, flechas, fumaça, neblina e efeitos
- centenas de PNGs exportados individualmente
- consistencia rigorosa entre retratos, sprites, animacoes, UI e tiles

Para um pack completo e realmente production ready, o proximo passo mais seguro e usar geracao em lote com transparencia nativa.
