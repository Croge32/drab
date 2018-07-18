defmodule DrabTestApp.LiveCommander do
  @moduledoc false
  # import Phoenix.HTML

  use Drab.Commander, modules: [Drab.Live, Drab.Element]
  onload(:page_loaded)
  broadcasting(:same_action)
  access_session(:current_user_id)

  def page_loaded(socket) do
    DrabTestApp.IntegrationCase.add_page_loaded_indicator(socket)
    DrabTestApp.IntegrationCase.add_pid(socket)
    poke(socket, text: "set in the commander")
    put_store(socket, :current_user_id, 44)
  end

  defhandler update_both(socket, _) do
    poke(socket, users: ["Mieczysław", "Andżelika", "Brajanek"], count: 3, color: "#66FFFF")
  end

  defhandler update_count(socket, _) do
    poke(socket, count: 3)
  end

  defhandler update_list(socket, _) do
    poke(socket, users: ["Mieczysław", "Andżelika", "Brajanek"])
  end

  defhandler update_in_partial1(socket, _) do
    poke(
      socket,
      "partial1.html",
      in_partial: "updated partial 1",
      color: "#66FFFF",
      link: "https://tg.pl/drab"
    )
  end

  defhandler update_in_partial2(socket, _) do
    poke(
      socket,
      DrabTestApp.Live2View,
      "partial2.html",
      in_partial: "updated partial 2",
      color: "#FF6666",
      link: "https://tg.pl/drab/live"
    )
  end

  defhandler update_in_partial2_bad(socket, _) do
    poke(
      socket,
      "partial2.html",
      in_partial: "updated partial 2",
      color: "#FF6666",
      link: "https://tg.pl/drab/live"
    )
  end

  defhandler update_in_partial3(socket, _) do
    poke(socket, "partial3.html", in_partial: "updated partial 3", link: "https://tg.pl/")
  end

  defhandler update_in_main_partial(socket, _) do
    poke(socket, color: "#aabbcc")
  end

  defhandler update_in_subpartial(socket, _) do
    poke(socket, "subfolder/subpartial.html", text: "UPDATED")
  end

  defhandler update_form(socket, sender) do
    poke(socket, out: sender.params)
  end

  defhandler update_link(socket, _) do
    poke(socket, link: "https://elixirforum.com")
  end

  defhandler add_item(socket, sender) do
    items = peek!(socket, :list)
    new_item = sender["form"]["drab[new_item]"]
    new_list = items ++ ["#{new_item}"]
    Drab.Live.poke(socket, list: new_list)
  end

  defhandler update_mini(socket, _sender) do
    # IO.inspect sender
    # IO.inspect(sender.params)
    # poke(socket, users: ["Mirmił", "Hegemon", "Kokosz", "Kajko"])
    # poke socket, text: "changed", color: "red", class2: "btn-danger"
    poke(socket, text: "changed")
  end

  defhandler shorten_url(socket, _sender) do
    # IO.inspect sender.params["long_url_textarea"]
    poke(socket, shorten_url: "SHORT", long_url: "LONG")
  end

  defhandler update_mini(socket, _sender, _additional) do
    # IO.inspect sender
    # IO.inspect(sender.params)
    # poke(socket, users: ["Mirmił", "Hegemon", "Kokosz", "Kajko"])
    # poke socket, text: "changed", color: "red", class2: "btn-danger"
    # IO.inspect additional
    poke(socket, color: "grey")
  end

  defhandler update_users(socket, _sender) do
    poke(socket, users: ["Mirmił", "Hegemon", "Kokosz", "Kajko"])
  end

  defhandler update_excluded_and_users(socket, _sender) do
    poke(socket, users: peek!(socket, :users), excluded: "Hegemon")
  end

  defhandler update_excluded(socket, _sender) do
    poke(socket, excluded: "Hegemon")
  end

  defhandler broadcast(socket, _sender) do
    broadcast_poke(socket, text: "broadcasted")
  end
end
