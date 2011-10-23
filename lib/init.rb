Dir['./lib/isolate*/lib'].each do |dir|
  $: << dir
end

require "rubygems"
require "isolate/now"

require "sinatra"
