using Microsoft.OpenApi.Models;
using Pet_shop.Services;

var builder = WebApplication.CreateBuilder(args);

// Carrega configura��es do appsettings
var config = builder.Configuration;

// Registrar o servi�o do Firebase
builder.Services.AddSingleton<FirebaseService>();

// Swagger com configura��es do appsettings
builder.Services.AddSwaggerGen(options =>
{
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);
});

// Add Controllers
builder.Services.AddControllers();

var app = builder.Build();

app.UseCors(policy =>
    policy.AllowAnyOrigin()
          .AllowAnyMethod()
          .AllowAnyHeader());

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
