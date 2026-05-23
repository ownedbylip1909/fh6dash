cask "fh6-telemetry" do
  version "1.0.0"
  sha256 :no_check

  url "https://github.com/Ownedbylip1909/fh6dash/releases/download/v#{version}/FH6.Telemetry-#{version}-arm64.dmg"
  name "FH6 Telemetry"
  desc "Forza Horizon 6 telemetry dashboard for macOS"
  homepage "https://github.com/Ownedbylip1909/fh6dash"

  app "FH6 Telemetry.app"

  caveat <<~EOS
    FH6 Telemetry is not notarized by Apple.
    On first launch: right-click the app → Open → Open.
  EOS
end
