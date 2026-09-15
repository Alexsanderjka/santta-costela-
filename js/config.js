/*
  CONFIGURAÇÕES DO SITE — SANTTA COSTELA
  =======================================
  Edite só este arquivo para trocar número de WhatsApp,
  itens do cardápio, preços e descrições.
*/

// Número de WhatsApp com DDI (55) + DDD + número, só dígitos.
// Confira se este número está completo (celulares no Brasil têm 11 dígitos: DDD + 9 dígitos).
const WHATSAPP_NUMBER = "5511992869801";

// Mensagem enviada quando alguém clica no botão flutuante ou "Chamar no WhatsApp" do topo,
// sem nenhum item selecionado ainda.
const WHATSAPP_GREETING = "Olá! Vim pelo site e quero fazer um pedido no Santta Costela.";

const MENU_ITEMS = [
  {
    id: "costela",
    name: "Costela no Bafo",
    description: "Costela bovina assada lentamente na brasa, no bafo, até desmanchar. O carro-chefe da casa.",
    price: 25,
    image: "images/costela.jpg"
  },
  {
    id: "linguica",
    name: "Linguiça Assada",
    description: "Linguiça artesanal assada na brasa, suculenta por dentro e levemente tostada por fora.",
    price: 25,
    image: "images/linguica.jpg"
  },
  {
    id: "frango",
    name: "Frango Assado",
    description: "Frango temperado e assado na brasa, com aquele toque defumado que só o fogo dá.",
    price: 25,
    image: "images/frango.jpg"
  },
  {
    id: "parmegiana",
    name: "Parmegiana de Frango",
    description: "Filé de frango empanado, coberto com molho da casa e queijo gratinado.",
    price: 30,
    image: "images/parmegiana.jpg"
  }
];
