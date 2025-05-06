package model

import (
    "fmt"
    "io"
    "time"
)


type Time time.Time

func (t Time) MarshalGQL(w io.Writer) {
    formatted := time.Time(t).Format(time.RFC3339)
    fmt.Fprintf(w, "%q", formatted)
}

func (t *Time) UnmarshalGQL(v interface{}) error {
    str, ok := v.(string)
    if !ok {
        return fmt.Errorf("time must be a string")
    }
    parsed, err := time.Parse(time.RFC3339, str)
    if err != nil {
        return err
    }
    *t = Time(parsed)
    return nil
}
