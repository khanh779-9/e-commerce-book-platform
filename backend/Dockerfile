# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY ["e-commerce-book-platform/e-commerce-book-platform.csproj", "e-commerce-book-platform/"]
RUN dotnet restore "e-commerce-book-platform/e-commerce-book-platform.csproj"

# Copy everything and build
COPY . .
WORKDIR "/src/e-commerce-book-platform"
RUN dotnet build "e-commerce-book-platform.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "e-commerce-book-platform.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser:appuser /app
USER appuser

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "e-commerce-book-platform.dll"]