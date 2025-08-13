using System.ComponentModel.DataAnnotations;

namespace Pet_shop.DTOs
{
    public class NewsletterDTO
    {
        [Required, EmailAddress]
        public string Email { get; set; }

        public DateTime DataInscricao { get; set; } = DateTime.Now;
    }
}
