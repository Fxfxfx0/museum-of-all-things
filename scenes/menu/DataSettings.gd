extends VBoxContainer

signal resume

var _data_ns = "data"
var _loaded_settings = false

func _on_back_pressed():
  _save_settings()
  emit_signal("resume")

func _ready():
  var settings = SettingsManager.get_settings(_data_ns)
  _loaded_settings = true
  if settings:
    $CacheOptions/CheckBox.button_pressed = settings.auto_limit_cache
    $CacheOptions/CacheSizeLimit.value = settings.get("cache_limit_size", 4e9) / 1e9
    $CacheOptions/CacheSizeLimit.editable = settings.auto_limit_cache

func _save_settings():
  SettingsManager.save_settings(_data_ns, _create_settings_obj())

func _check_box_toggled(toggled_on: bool):
  $CacheOptions/CacheSizeLimit.editable = toggled_on

func _create_settings_obj():
  return {
    "auto_limit_cache": $CacheOptions/CheckBox.button_pressed,
    "cache_limit_size": int($CacheOptions/CacheSizeLimit.value * 1e9)
  }

func _on_visibility_changed():
  if visible:
    _refresh_cache_label()
  if _loaded_settings and not visible:
    _save_settings()

func _refresh_cache_label():
  var result = CacheControl.get_cache_size()
  $CacheOptions/CacheLabel.text = "Cache (%s items, %3.2f GB)" % [result.count, result.size / 1000000000.0]

func _on_clear_cache_pressed():
  CacheControl.clear_cache()
  _refresh_cache_label()

func _on_cache_size_limit_value_changed(value: float):
  $CacheOptions/CacheSizeLimitValue.text = "%d Gb" % int(value)
