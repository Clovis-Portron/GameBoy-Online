<?php
/**
 * Created by PhpStorm.
 * User: clovis
 * Date: 07/05/17
 * Time: 18:59
 */

interface ICoreAnnotation
{
    public function validate($value);
}

class IntegrityException extends Exception
{

}

/**
 * @Target("property")
 */
class Size extends Annotation implements ICoreAnnotation
{
    public $min;
    public $max;

    public function checkConstraints($target)
    {
        if(($this->min != null && (is_numeric($this->min) == false || $this->min < 0)) || ($this->max != null && (is_numeric($this->max) == false || $this->max < 0)))
            throw new IntegrityException("min and max must be numeric and greater or equal than 0.");
    }

    public function validate($value)
    {
        if($value == null)
            return;
        if (is_string($value) == false)
        {
            throw new IntegrityException("Property must be a string", 100);
        }
        if($this->min != null && strlen($value) < $this->min)
        {
            throw new IntegrityException("Property must be longer (or equal) than ".$this->min, 101);
        }
        if($this->max != null && strlen($value) > $this->max)
        {
            throw new IntegrityException("Property must be shorter (or equal) than ".$this->max, 102);
        }
    }
}

/**
 * @Target("property")
 */
class Word extends Annotation implements ICoreAnnotation
{
    public function validate($value)
    {
        if($value == null || $value == "")
            return;
        if (is_string($value) == false)
        {
            throw new IntegrityException("Property must be a string", 100);
        }
    }
}

/**
 * @Target("property")
 */
class Numeric extends Annotation implements ICoreAnnotation
{
    public function validate($value)
    {
        if($value == null || $value ==  "")
            return;
        if (is_numeric($value) == false)
        {
            throw new IntegrityException("Property must be a numeric", 103);
        }
    }
}

/**
 * @Target("property")
 */
class Boolean extends Annotation implements ICoreAnnotation
{
    public function validate($value)
    {
        if($value == null || $value != "")
            return;
        if (is_bool($value) == false)
        {
            throw new IntegrityException("Property must be a boolean", 106);
        }
    }
}



/**
 * @Target("property")
 */
class Pattern extends Annotation implements ICoreAnnotation
{
    public function validate($value)
    {
        if($value == null)
            return;
        $rex = "/".$this->value."/";
        if(preg_match($rex, $value) != 1)
        {
            throw new IntegrityException("Property must match ".$rex, 104);
        }
    }
}

/**
 * @Target("property")
 */
class Required extends Annotation implements ICoreAnnotation
{
    public function validate($value)
    {
        if($value === null || $value === "")
        {
            throw new IntegrityException("Property cant be null", 105);
        }
    }
}