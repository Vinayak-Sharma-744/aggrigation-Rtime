export async function sendData(users:string): Promise<void> {

    // const userString = users.join(", ");

    const url = "https://chat.googleapis.com/v1/spaces/AAAAovBKXSM/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=34mzsEKalKoGEB35nqc-6zzCwRAeAKpUIHHJ7MKPxO8";
    
    try {

        const res = await fetch(url, {

            method: "POST",

            headers: { "Content-Type": "application/json; charset=UTF-8" },

            body: JSON.stringify({
                cards: [
                  {
                    header: {
                      title: "Timesheet Reminder",
                      subtitle: "You missed today's timesheet",
                      imageUrl: "https://cdn.botpenguin.com/assets/upload/uc-AD-795bf8ea2560495c879b0258fbdb131b-zh-gK.jpeg"
                    },
                    sections: [
                      {
                        widgets: [
                          {
                            textParagraph: {
                              text: `
                                <div style="font-family: Arial, sans-serif; color: #333; font-size: 16px; line-height: 1.5;">
                                  <p><b><mention>${users}</mention></b></p>
                                  <p>We hope this message finds you well. It appears that you missed today's timesheet.</p>
                                  <p>Please take a moment to fill out your timesheet promptly to ensure accurate records.</p>
                                  <p>Your timely cooperation is highly appreciated.</p>
                                </div>
                              `,
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              }
              ),
        });

        console.log(await res.json());

    } catch (error) {
        
        console.error("Error sending reminder:", error);
    }
}

