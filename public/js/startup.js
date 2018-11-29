function loadTeams (tagName) {
  const teams = [
    'River Plate',
    'Boca Juniors',
    'Independiente',
    'Argentinos Juniors',
    'Atlético Tucumán',
    'Aldosivi',
    'Banfield',
    'Colón de Santa Fe',
    'Defensa y Justicia',
    'Estudiantes La Plata',
    'Gimnasia La Plata',
    'Godoy Cruz de Mendoza',
    'Huracán',
    'Lanús',
    'Newells Old Boys',
    'Racing Club',
    'Rosario Central',
    'San Lorenzo',
    'San Martín de Tucumán',
    'San Martín de San Juan',
    'Talleres de Córdoba',
    'Tigre',
    'Unión de Santa Fe',
    'Vélez Sarsfield',
    'Belgrano de Córdoba',
    'Patronato de Paraná'
  ]

  $('#' + tagName).empty()

  var teamsSorted = teams.sort()
  $.each(teamsSorted, function (i, item) {
    $('#' + tagName).append($('<option/>').attr('value', item).text(item))
  })

  document.getElementById(tagName).selectedIndex = -1
}

$(document).ready(function () {
  // Dropdown menus
  $('.ui.menu .ui.dropdown').dropdown({
    on: 'hover'
  })

  // Tabs
  $('.ui.menu a.item').on('click', function() {
    $(this).addClass('active').siblings().removeClass('active');
  })

  $('.menu .item').tab()
  $.tab()

  // Message alerts
  $('.message .close').on('click', function () {
    $(this).closest('.message').transition('fade')
  })

  // Checkboxes
  $('.ui.checkbox').checkbox()

  loadTeams('cboLocalTeam')
  loadTeams('cboVisitorTeam')
})
