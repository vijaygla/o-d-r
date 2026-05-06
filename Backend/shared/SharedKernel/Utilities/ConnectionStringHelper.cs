using System;

namespace SharedKernel.Utilities;

public static class ConnectionStringHelper
{
    public static string ConvertToNpgsql(string connectionUri)
    {
        if (string.IsNullOrEmpty(connectionUri))
        {
            return connectionUri;
        }

        // Handle both postgres:// and postgresql://
        if (!connectionUri.StartsWith("postgresql://") && !connectionUri.StartsWith("postgres://"))
        {
            return connectionUri;
        }

        try
        {
            var uri = new Uri(connectionUri);
            var userInfo = uri.UserInfo.Split(':');
            var username = userInfo[0];
            var password = userInfo.Length > 1 ? userInfo[1] : "";
            var host = uri.Host;
            var port = uri.Port > 0 ? uri.Port : 5432;
            var database = uri.AbsolutePath.TrimStart('/');

            return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
        }
        catch
        {
            return connectionUri;
        }
    }
}
